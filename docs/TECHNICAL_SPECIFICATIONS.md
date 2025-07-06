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

## Installation und Deployment

### Automatische Installation (Windows)

**Voraussetzungen:**
- Windows 10/11
- PowerShell 5.1+
- Python 3.8+
- Node.js 16+

**Setup-Skript:**
```powershell
.\setup.ps1
```

Das Setup-Skript führt folgende Schritte automatisch aus:
1. Systemvoraussetzungen prüfen
2. Python Virtual Environment erstellen
3. Backend-Abhängigkeiten installieren
4. Frontend-Abhängigkeiten installieren
5. Backend und Frontend automatisch starten

### Manuelle Installation

**Backend Setup:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# oder
.venv\Scripts\activate.bat  # Windows
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

### Ports und URLs

- **Backend API**: `http://localhost:8000`
- **Frontend**: `http://localhost:5173`
- **API Documentation**: `http://localhost:8000/docs`

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

### Routing

```typescript
interface Routes {
  "/": HomePage;
  "/upload": UploadPage;
}
```

## Backend-Architektur

### Dateistruktur

```
backend/
├── src/
│   ├── main.py              # FastAPI-Anwendung
│   └── json_parser.py       # XML-Parser
├── data/                    # Datenspeicher
│   ├── esl-total.json
│   └── sdat-total.json
└── requirements.txt         # Python-Abhängigkeiten
```

### Hauptkomponenten

#### FastAPI-Anwendung (main.py)
- **CORS-Konfiguration**: Erlaubt Cross-Origin-Requests
- **File Upload**: Multipart-Form-Data-Handling
- **Error Handling**: Umfassende Exception-Behandlung
- **Data Storage**: JSON-basierte Datenspeicherung

#### XML-Parser (json_parser.py)
- **SDAT-Parser**: Verarbeitet Verbrauchswerte
- **ESL-Parser**: Verarbeitet Zählerstände
- **Validation**: XML-Struktur-Validierung
- **Data Transformation**: Konvertierung zu JSON-Format

### Datenpersistierung

#### Speicherformat
- **Dateibasiert**: JSON-Dateien im `data/`-Verzeichnis
- **Struktur**: Separate Dateien für SDAT und ESL-Daten
- **Backup**: Automatische Sicherung vor Überschreibung

#### Datenintegrität
- **Deduplizierung**: Automatische Duplikatserkennung
- **Validierung**: Format- und Strukturprüfung
- **Error Recovery**: Robuste Fehlerbehandlung

## Performance-Optimierungen

### Frontend
- **Lazy Loading**: Komponenten werden bei Bedarf geladen
- **Memoization**: React.memo für Performance-kritische Komponenten
- **Bundle Splitting**: Code-Splitting mit Vite
- **Caching**: Browser-Cache für statische Assets

### Backend
- **Async Processing**: Asynchrone Dateiverarbeitung
- **Memory Management**: Effiziente Speichernutzung
- **Error Handling**: Graceful Degradation bei Fehlern

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
- **File Type**: Überprüfung der Dateiendungen

### Input-Sanitization
- **XML-Parsing**: Sichere XML-Verarbeitung
- **Data Validation**: Typprüfung und Bereichsvalidierung

## Monitoring und Logging

### Logging-Konfiguration
- **Level**: INFO für Produktion, DEBUG für Entwicklung
- **Format**: Strukturierte Logs mit Zeitstempel
- **Output**: Console und Datei-Logging

### Performance-Monitoring
- **Response Times**: API-Antwortzeiten
- **Memory Usage**: Speicherverbrauch
- **Error Rates**: Fehlerquoten

## Deployment

### Produktionsumgebung
- **Web Server**: Nginx oder Apache
- **Process Manager**: PM2 oder systemd
- **SSL/TLS**: HTTPS-Verschlüsselung
- **Load Balancer**: Für hohe Verfügbarkeit

### Container-Deployment
```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Wartung und Updates

### Regelmässige Wartung
- **Log-Rotation**: Automatische Log-Datei-Rotation
- **Data Backup**: Regelmässige Datensicherung
- **Dependency Updates**: Sicherheitsupdates für Abhängigkeiten

### Update-Prozess
1. **Backup**: Datensicherung vor Update
2. **Testing**: Tests in Staging-Umgebung
3. **Deployment**: Rollout in Produktion
4. **Verification**: Funktionsprüfung nach Update

---

**Entwickelt für die Energieagentur Bünzli**  
*Projektgruppe 1 – M306*  
*Version 1.0 - Juli 2025* 