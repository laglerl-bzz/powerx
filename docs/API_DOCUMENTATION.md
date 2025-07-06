# PowerX API Dokumentation

## Übersicht

Die PowerX API ist eine REST-basierte Schnittstelle zur Verarbeitung und Verwaltung von Stromzählerdaten. Die API unterstützt das Hochladen, Abrufen und Löschen von sdat- und ESL-Dateien.

## Installation

### Automatische Installation (Windows)

**Voraussetzungen:**
- Windows 10/11
- PowerShell 5.1+
- Python 3.8+
- Node.js 16+

**Setup:**
```powershell
.\setup.ps1
```

Das Setup-Skript startet automatisch:
- Backend API auf Port 8000
- Frontend auf Port 5173

### Manuelle Installation

**Backend starten:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# oder
.venv\Scripts\activate.bat  # Windows
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

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

### HTTP-Status-Codes

| Status | Beschreibung |
|--------|--------------|
| 200 | OK - Erfolgreiche Operation |
| 400 | Bad Request - Ungültige Anfrage |
| 404 | Not Found - Ressource nicht gefunden |
| 500 | Internal Server Error - Server-Fehler |

### Fehlermeldungen

#### Upload-Fehler
```json
{
  "success": false,
  "error": "Ungültige XML-Datei: Erwartete sdat-Struktur nicht gefunden"
}
```

#### Validierungsfehler
```json
{
  "success": false,
  "error": "Datei zu gross: Maximale Grösse ist 10MB"
}
```

#### Server-Fehler
```json
{
  "success": false,
  "error": "Interner Server-Fehler beim Verarbeiten der Datei"
}
```

## Datenverarbeitung

### Deduplizierung

#### SDAT-Daten
- Duplikate werden basierend auf dem vollständigen Eintrag erkannt
- Vergleichskriterien: documentID, interval, resolution, data
- Neuere Daten überschreiben ältere Duplikate

#### ESL-Daten
- Duplikate werden basierend auf dem Monat erkannt
- Vergleichskriterium: month
- Alle ESL-Einträge für denselben Monat werden zusammengeführt

### Validierung

#### SDAT-Validierung
- XML-Struktur muss sdat-Format entsprechen
- DocumentID muss ID742 oder ID735 sein
- Zeitstempel müssen gültige ISO-8601-Formate sein
- Resolution muss 15 Minuten betragen

#### ESL-Validierung
- XML-Struktur muss ESL-Format entsprechen
- Monatsformat muss YYYY-MM sein
- OBIS-Codes müssen gültig sein
- Werte müssen numerisch sein

## Performance

### Optimierungen
- **Asynchrone Verarbeitung**: Dateien werden asynchron verarbeitet
- **Memory Management**: Effiziente Speichernutzung bei grossen Dateien
- **Caching**: Häufig abgerufene Daten werden gecacht

### Limits
- **Dateigrösse**: Maximale Dateigrösse pro Upload: 10MB
- **Anzahl Dateien**: Maximale Anzahl Dateien pro Request: 10
- **Timeout**: Request-Timeout: 30 Sekunden

## Sicherheit

### CORS-Konfiguration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Dateivalidierung
- **XML-Struktur**: Validierung der XML-Dokumentstruktur
- **File Size**: Begrenzung der Dateigrösse
- **File Type**: Überprüfung der Dateiendungen (.xml)

### Input-Sanitization
- **XML-Parsing**: Sichere XML-Verarbeitung mit xml.etree.ElementTree
- **Data Validation**: Typprüfung und Bereichsvalidierung
- **Error Handling**: Umfassende Exception-Behandlung

## Monitoring

### Logging
- **Level**: INFO für Produktion, DEBUG für Entwicklung
- **Format**: Strukturierte Logs mit Zeitstempel
- **Output**: Console-Logging

### Metriken
- **Response Times**: API-Antwortzeiten
- **Upload Success Rate**: Erfolgsrate bei Uploads
- **Error Rates**: Fehlerquoten nach Endpunkt

## Beispiele

### Python-Client

```python
import requests

# Datei hochladen
with open('data.xml', 'rb') as f:
    files = {'files': f}
    data = {'file_type': 'sdat'}
    response = requests.post('http://localhost:8000/upload', files=files, data=data)
    print(response.json())

# Daten abrufen
response = requests.get('http://localhost:8000/data-sdat')
data = response.json()
print(data)
```

### JavaScript-Client

```javascript
// Datei hochladen
const formData = new FormData();
formData.append('file_type', 'sdat');
formData.append('files', fileInput.files[0]);

fetch('http://localhost:8000/upload', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log(data));

// Daten abrufen
fetch('http://localhost:8000/data-sdat')
.then(response => response.json())
.then(data => console.log(data));
```

### cURL-Beispiele

```bash
# Alle SDAT-Daten abrufen
curl "http://localhost:8000/data-sdat"

# Alle ESL-Daten abrufen
curl "http://localhost:8000/data-esl"

# Mehrere Dateien hochladen
curl -X POST "http://localhost:8000/upload" \
  -F "file_type=sdat" \
  -F "files=@file1.xml" \
  -F "files=@file2.xml"

# Alle Daten löschen
curl "http://localhost:8000/clear"
```

## Troubleshooting

### Häufige Probleme

#### "Backend nicht erreichbar"
- Überprüfen Sie, ob das Backend läuft (Port 8000)
- Prüfen Sie die Firewall-Einstellungen
- Starten Sie das Backend neu

#### "Ungültige XML-Datei"
- Überprüfen Sie das XML-Format
- Stellen Sie sicher, dass es sich um sdat/ESL-Dateien handelt
- Validieren Sie die XML-Struktur

#### "Datei zu gross"
- Teilen Sie grosse Dateien auf
- Komprimieren Sie die Dateien
- Überprüfen Sie die Dateigrösse (max. 10MB)

---

**Entwickelt für die Energieagentur Bünzli**  
*Projektgruppe 1 – M306*  
*Version 1.0 - Juli 2025* 