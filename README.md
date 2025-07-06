# PowerX - Stromdaten Visualisierung

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-green.svg)](https://fastapi.tiangolo.com/)

## 📋 Projektübersicht

PowerX ist eine Softwarelösung zur Verarbeitung und Visualisierung von Stromzählerdaten für die Schweizer Energiewirtschaft. Die Anwendung ermöglicht es Energieberatern, Haustechnikunternehmen, Gemeinden und Elektrizitätswerken, komplexe XML-Datenaustauschformate einfach zu interpretieren und zu analysieren.

### 🎯 Hauptfunktionen

- **Datenintegration**: Einlesen und Verarbeiten von sdat-Files (Verbrauchswerte) und ESL-Files (absolute Zählerstände)
- **Datenverknüpfung**: Verknüpfung relativer Verbrauchswerte mit absoluten Zählerständen
- **Visualisierung**: Intuitive Diagramme für Verbrauchs- und Zählerstandsdaten
- **Export**: Export der verarbeiteten Daten in CSV und JSON-Formate

### 📊 Unterstützte Datenformate

- **sdat-Files**: Verbrauchswerte (15-Minuten-Intervalle, IDs 742/735)
- **ESL-Files**: Absolute Zählerstände (monatliche Daten, OBIS-Codes)

## 🚀 Schnellstart

### Automatisches Setup (Empfohlen)

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Windows (Command Prompt):**
```cmd
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

Die Setup-Skripte führen automatisch alle notwendigen Schritte aus:
- ✅ Prüfung der Systemvoraussetzungen
- ✅ Installation der Abhängigkeiten
- ✅ Erstellung der Virtual Environment
- ✅ Erstellung von Start-Skripten

### Manuelles Setup

#### Voraussetzungen

- Python 3.8+
- Node.js 16+
- npm oder yarn

#### Backend Setup

```bash
# Backend-Verzeichnis wechseln
cd backend

#venv inizaliere
python -m venv .venv

# Python-Abhängigkeiten installieren
pip install -r .\requirements.txt

#aktivierung Venv für Powershell
.venv\Scripts\Activate.ps1

#aktivierung Venv für Bash - Windows
source .venv/Scripts/activate

#aktivierung Venv für Bash - Linux
source .venv/bin/activate

# Backend starten
uvicorn src.main:app --reload
```

Das Backend läuft standardmässig auf `http://localhost:8000`

#### Frontend Setup

```bash
# Frontend-Verzeichnis wechseln
cd frontend

# Node.js-Abhängigkeiten installieren
npm install

# Frontend starten
npm run dev
```

Das Frontend läuft standardmässig auf `http://localhost:5173`

## 🏗️ Systemarchitektur

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Frontend      │ ◄─────────────► │    Backend      │
│   (React/Vite)  │                 │   (FastAPI)     │
│   Port: 5173    │                 │   Port: 8000    │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Recharts      │                 │   XML Parser    │
│   Visualisierung│                 │   Datenbank     │
└─────────────────┘                 └─────────────────┘
```

## 📁 Projektstruktur

```
m306-powerx/
├── backend/
│   ├── data/                 # Beispieldaten
│   │   ├── esl-total.json
│   │   └── sdat-total.json
│   ├── requirements.txt      # Python-Abhängigkeiten
│   └── src/
│       ├── json_parser.py    # XML-Parser für sdat/ESL
│       └── main.py          # FastAPI-Anwendung
├── frontend/
│   ├── src/
│   │   ├── components/       # React-Komponenten
│   │   │   ├── chart/        # Chart-Komponenten
│   │   │   ├── upload/       # Upload-Komponenten
│   │   │   └── ui/           # UI-Komponenten
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── services/         # API-Services
│   │   ├── types/            # TypeScript-Definitionen
│   │   └── constants/        # Konstanten und Konfiguration
│   ├── package.json
│   └── vite.config.ts
├── docs/                     # Dokumentation
├── setup.ps1                 # Windows PowerShell Setup
├── setup.sh                  # Linux/macOS Setup
├── setup.bat                 # Windows Command Prompt Setup
└── README.md
```

## 🔧 Verwendung

### 1. Daten-Upload

1. Navigieren Sie zur Upload-Seite (`/upload`)
2. Wählen Sie den Dateityp (SDAT oder ESL)
3. Laden Sie XML-Dateien per Drag & Drop oder Dateiauswahl hoch
4. Die Dateien werden automatisch validiert und verarbeitet

### 2. Datenvisualisierung

1. Gehen Sie zur Hauptseite (`/`)
2. Wählen Sie den gewünschten Zeitraum (Tag/Woche/Monat/Jahr)
3. Wählen Sie ein Preset für die Darstellung
4. Die Daten werden in interaktiven Diagrammen angezeigt

### 3. Datenexport

1. Verwenden Sie die Export-Buttons in der Chart-Steuerung
2. Wählen Sie zwischen CSV und JSON-Format
3. Die aktuell angezeigten Daten werden exportiert

## 📊 API-Dokumentation

### Endpunkte

- `GET /api/data` - Alle Daten abrufen
- `POST /api/upload` - Dateien hochladen
- `GET /api/clear` - Alle Daten löschen

### Beispiel-Requests

```bash
# Alle Daten abrufen
curl "http://localhost:8000/api/data"

# Datei hochladen
curl -X POST "http://localhost:8000/api/upload" \
  -F "file_type=sdat" \
  -F "files=@data.xml"
```

## 🎨 Features

### Frontend Features

- **Responsive Design**: Optimiert für Desktop und Mobile
- **Dark/Light Mode**: Umschaltbare Themes
- **Interaktive Charts**: Zoom, Hover-Effekte, Tooltips
- **Zeitfilter**: Flexible Zeitraumauswahl
- **Presets**: Vordefinierte Darstellungsoptionen
- **Export**: CSV und JSON-Export

### Backend Features

- **XML-Parser**: Robuste Verarbeitung von sdat und ESL-Dateien
- **Datenvalidierung**: Automatische Fehlererkennung
- **Zeitreihen-Join**: Verknüpfung von relativen und absoluten Werten
- **REST-API**: Standardisierte Schnittstellen
- **Fehlerbehandlung**: Umfassende Exception-Behandlung

## 🔒 Sicherheit

- **CORS-Konfiguration**: Sichere Cross-Origin-Requests
- **Dateivalidierung**: XML-Struktur-Validierung
- **Input-Sanitization**: Schutz vor schädlichen Eingaben


## 📞 Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam oder erstellen Sie ein Issue im Repository.

---

**Entwickelt für die Energieagentur Bünzli**  
*Projektgruppe 1 – M306*  
*Version 1.0 - Juli 2025*