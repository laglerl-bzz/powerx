# PowerX Technische Spezifikationen

## Systemarchitektur

### Übersicht

PowerX ist eine Full-Stack-Webanwendung zur Verarbeitung und Visualisierung von Stromzählerdaten:

```
┌─────────────────────────────────────────────────────┐
│                        Frontend                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   React     │  │   Vite      │  │  Recharts   │  │
│  │ Components  │  │   Build     │  │  Charts     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────┐
│                        Backend                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  FastAPI    │  │ XML Parser  │  │   Data      │  │
│  │   Server    │  │   Engine    │  │  Storage    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Technologie-Stack

#### Frontend
- **Framework**: React 18 mit TypeScript
- **Build Tool**: Vite 4.x
- **Styling**: Tailwind CSS
- **Charts**: Recharts 2.x
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

#### Backend
- **Framework**: FastAPI (Python 3.9+)
- **XML Processing**: xml.etree.ElementTree
- **Data Storage**: JSON files on disk
- **CORS**: FastAPI CORS Middleware
- **File Handling**: Python Standard Library

## Datenmodelle

### SDAT-Datenstruktur

```typescript
interface SDATData {
  "sdat-data": SDATEntry[];
}

interface SDATEntry {
  documentID: 'ID742' | 'ID735';
  interval: {
    startDateTime: string;  // ISO 8601
    endDateTime: string;    // ISO 8601
  };
  resolution: number;       // Minuten
  data: DataPoint[];
}

interface DataPoint {
  sequence: number;
  volume: number;          // kWh
}
```

### ESL-Datenstruktur

```typescript
interface ESLData {
  "esl-data": ESLEntry[];
}

interface ESLEntry {
  month: string;           // YYYY-MM
  data: ObisValue[];
}

interface ObisValue {
  obis: string;            // OBIS-Code
  value: number;           // kWh
}
```

## API-Spezifikationen

### Endpunkte

#### GET /data-esl
Ruft alle gespeicherten ESL-Daten ab. Die Daten werden nach Monat sortiert.

**Response:**
```json
{
  "esl-data": ESLEntry[]
}
```

#### GET /data-sdat
Ruft alle gespeicherten SDAT-Daten ab.

**Response:**
```json
{
  "sdat-data": SDATEntry[]
}
```

#### POST /upload
Lädt XML-Dateien hoch und verarbeitet diese.

**Request Body:** FormData
- `file_type` (string): "sdat" | "esl"
- `files` (File[]): Array von XML-Dateien

**Response (Erfolg):**
```json
{
  "success": true,
  "sdat-data": SDATEntry[] | "esl-data": ESLEntry[]
}
```

**Response (Fehler):**
```json
{
  "success": false,
  "error": "Fehlermeldung"
}
```

#### GET /clear
Löscht alle gespeicherten Daten.

**Response:**
```json
{
  "message": "All data stores have been cleared."
}
```

### Fehlercodes

| HTTP Status | Code | Beschreibung |
|-------------|------|--------------|
| 200 | OK | Erfolgreiche Operation |
| 400 | BAD_REQUEST | Ungültige Anfrage |
| 404 | NOT_FOUND | Ressource nicht gefunden |
| 500 | INTERNAL_SERVER_ERROR | Server-Fehler |

### Datenverarbeitung

#### Deduplizierung
- **SDAT-Daten**: Duplikate werden basierend auf dem vollständigen Eintrag erkannt und entfernt
- **ESL-Daten**: Duplikate werden basierend auf dem Monat erkannt und entfernt

#### Validierung
- **SDAT-Dateien**: Nur gültige SDAT-Einträge werden gespeichert
- **ESL-Dateien**: Alle ESL-Einträge werden gespeichert

## Frontend-Komponenten

### Komponenten-Hierarchie

```
App
├── ThemeProvider
├── Navbar
└── Routes
    ├── HomePage
    │   └── Chart
    └── UploadPage
```

### State Management

#### Chart State
```typescript
interface ChartState {
  data: any[];
  loading: boolean;
  error: string | null;
  timespan: string;  // Frontend-Filter für Zeitraum
}
```

#### Upload State
```typescript
interface UploadState {
  files: File[];
  fileType: string;
  isUploading: boolean;
  error: string | null;
  result: any | null;
}
```

## Sicherheit

### CORS-Konfiguration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### File Upload Security
```python
def validate_xml_file(file: UploadFile) -> bool:
    """Validiert XML-Dateien vor Verarbeitung"""
    # Dateityp-Validierung
    if not file.filename.endswith('.xml'):
        raise ValueError("Invalid file type")
    
    # XML-Struktur-Validierung
    try:
        content = file.file.read()
        ET.fromstring(content)
        return True
    except ET.ParseError:
        raise ValueError("Invalid XML structure")
```

## Datenfluss

### Upload-Prozess
1. Benutzer wählt Dateityp (SDAT/ESL)
2. Dateien werden hochgeladen
3. Backend parst XML und konvertiert zu JSON
4. Daten werden dedupliziert und gespeichert
5. Erfolgs-/Fehlermeldung wird zurückgegeben

### Visualisierung
1. Frontend lädt alle Daten vom Backend
2. Daten werden im Frontend nach Zeitraum gefiltert
3. Gefilterte Daten werden in Charts visualisiert
4. Benutzer kann verschiedene Zeiträume auswählen

---

**Technische Dokumentation Version 1.0**  
*Letzte Aktualisierung: Dezember 2024* 