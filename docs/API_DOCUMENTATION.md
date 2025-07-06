# PowerX API Dokumentation

## Übersicht

Die PowerX API ist eine REST-basierte Schnittstelle zur Verarbeitung und Verwaltung von Stromzählerdaten. Die API unterstützt das Hochladen, Abrufen und Löschen von sdat- und ESL-Dateien.

## Basis-URL

```
http://localhost:8000
```

## Authentifizierung

Aktuell ist keine Authentifizierung erforderlich. Alle Endpunkte sind öffentlich zugänglich.

## Endpunkte

### 1. ESL-Daten abrufen

**GET** `/data-esl`

Ruft alle gespeicherten ESL-Daten ab. Die Daten werden nach Monat sortiert zurückgegeben.

#### Beispiel-Request

```bash
curl "http://localhost:8000/data-esl"
```

#### Beispiel-Response

```json
{
  "esl-data": [
    {
      "month": "2024-01",
      "data": [
        {
          "obis": "1-1:1.8.1",
          "value": 100.5
        }
      ]
    }
  ]
}
```

### 2. SDAT-Daten abrufen

**GET** `/data-sdat`

Ruft alle gespeicherten SDAT-Daten ab.

#### Beispiel-Request

```bash
curl "http://localhost:8000/data-sdat"
```

#### Beispiel-Response

```json
{
  "sdat-data": [
    {
      "documentID": "ID735",
      "interval": {
        "startDateTime": "2024-01-01T00:00:00",
        "endDateTime": "2024-01-01T23:59:59"
      },
      "resolution": 15,
      "data": [
        {
          "sequence": 1,
          "volume": 0.5
        }
      ]
    }
  ]
}
```

### 3. Dateien hochladen

**POST** `/upload`

Lädt sdat- oder ESL-Dateien hoch und verarbeitet diese. Die Daten werden automatisch dedupliziert und in den entsprechenden Speicher geschrieben.

#### Request-Body

FormData mit folgenden Feldern:

| Feld | Typ | Beschreibung | Beispiel |
|------|-----|--------------|----------|
| `file_type` | string | Dateityp (sdat oder esl) | `sdat` |
| `files` | file[] | Array von XML-Dateien | `data.xml` |

#### Beispiel-Request

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file_type=sdat" \
  -F "files=@data1.xml" \
  -F "files=@data2.xml"
```

#### Beispiel-Response (Erfolg)

```json
{
  "success": true,
  "sdat-data": [
    {
      "documentID": "ID735",
      "interval": {
        "startDateTime": "2024-01-01T00:00:00",
        "endDateTime": "2024-01-01T23:59:59"
      },
      "resolution": 15,
      "data": [
        {
          "sequence": 1,
          "volume": 0.5
        }
      ]
    }
  ]
}
```

#### Beispiel-Response (Fehler)

```json
{
  "success": false,
  "error": "Ungültige XML-Datei: Erwartete sdat-Struktur nicht gefunden"
}
```

### 4. Alle Daten löschen

**GET** `/clear`

Löscht alle gespeicherten Daten vom Server.

#### Beispiel-Request

```bash
curl "http://localhost:8000/clear"
```

#### Beispiel-Response

```json
{
  "message": "All data stores have been cleared."
}
```

## Datenformate

### SDAT-Format

```json
{
  "sdat-data": [
    {
      "documentID": "ID735|ID742",
      "interval": {
        "startDateTime": "ISO-8601-Timestamp",
        "endDateTime": "ISO-8601-Timestamp"
      },
      "resolution": 15,
      "data": [
        {
          "sequence": 1,
          "volume": 0.5
        }
      ]
    }
  ]
}
```

### ESL-Format

```json
{
  "esl-data": [
    {
      "month": "YYYY-MM",
      "data": [
        {
          "obis": "1-1:1.8.1",
          "value": 100.5
        }
      ]
    }
  ]
}
```

## Fehlercodes

| HTTP-Status | Beschreibung | Beispiel |
|-------------|--------------|----------|
| 200 | Erfolgreich | Daten erfolgreich abgerufen |
| 400 | Ungültige Anfrage | Falsche Datei oder Parameter |
| 404 | Nicht gefunden | Endpunkt existiert nicht |
| 500 | Server-Fehler | Interner Verarbeitungsfehler |

### Beispiel-Fehler-Response

```json
{
  "detail": "Ungültige XML-Datei: Erwartete sdat-Struktur nicht gefunden"
}
```

## Rate Limiting

Aktuell sind keine Rate-Limits implementiert.

## CORS

Die API unterstützt Cross-Origin-Requests für die folgenden Domains:
- `http://localhost:5173` (Frontend Development)

## Beispiele

### Python

```python
import requests

# ESL-Daten abrufen
response = requests.get("http://localhost:8000/data-esl")
esl_data = response.json()

# SDAT-Daten abrufen
response = requests.get("http://localhost:8000/data-sdat")
sdat_data = response.json()

# Datei hochladen
files = {'files': open('data.xml', 'rb')}
data = {'file_type': 'sdat'}
response = requests.post("http://localhost:8000/upload", files=files, data=data)

# Alle Daten löschen
response = requests.get("http://localhost:8000/clear")
```

### JavaScript

```javascript
// ESL-Daten abrufen
const eslResponse = await fetch('http://localhost:8000/data-esl');
const eslData = await eslResponse.json();

// SDAT-Daten abrufen
const sdatResponse = await fetch('http://localhost:8000/data-sdat');
const sdatData = await sdatResponse.json();

// Datei hochladen
const formData = new FormData();
formData.append('file_type', 'sdat');
formData.append('files', fileInput.files[0]);

const uploadResponse = await fetch('http://localhost:8000/upload', {
  method: 'POST',
  body: formData
});

// Alle Daten löschen
const clearResponse = await fetch('http://localhost:8000/clear');
```

## Datenverarbeitung

### Deduplizierung

- **SDAT-Daten**: Duplikate werden basierend auf dem vollständigen Eintrag erkannt und entfernt
- **ESL-Daten**: Duplikate werden basierend auf dem Monat erkannt und entfernt

### Validierung

- **SDAT-Dateien**: Nur gültige SDAT-Einträge werden gespeichert
- **ESL-Dateien**: Alle ESL-Einträge werden gespeichert

## Versionierung

Aktuelle API-Version: `v1.0`

Die API verwendet keine explizite Versionsnummerierung in der URL. Breaking Changes werden in zukünftigen Versionen dokumentiert.

## Support

Bei Fragen zur API wenden Sie sich an das Entwicklungsteam oder erstellen Sie ein Issue im Repository. 