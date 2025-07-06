# PowerX Setup Script für Windows (PowerShell)
# Führt automatisch alle notwendigen Schritte aus, um PowerX zu installieren und zu starten

# Set proper encoding for PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "[INFO] PowerX Setup Script für Windows" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Prüfe ob Python installiert ist
Write-Host "`n[CHECK] Prüfe Python-Installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python gefunden: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installieren Sie Python 3.8+ von https://www.python.org/" -ForegroundColor Red
    Write-Host "Stellen Sie sicher, dass 'Add Python to PATH' aktiviert ist." -ForegroundColor Red
    exit 1
}

# Prüfe ob Node.js installiert ist
Write-Host "`n[CHECK] Prüfe Node.js-Installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[OK] Node.js gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installieren Sie Node.js 16+ von https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Prüfe ob npm installiert ist
Write-Host "`n[CHECK] Prüfe npm-Installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "[OK] npm gefunden: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm ist nicht installiert!" -ForegroundColor Red
    exit 1
}

# Backend Setup
Write-Host "`n[SETUP] Backend Setup..." -ForegroundColor Yellow
Write-Host "[INFO] Wechsle zu Backend-Verzeichnis..." -ForegroundColor Cyan
Set-Location backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Backend-Verzeichnis nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Prüfe ob requirements.txt existiert
if (-not (Test-Path "requirements.txt")) {
    Write-Host "[ERROR] requirements.txt nicht gefunden im Backend-Verzeichnis!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] requirements.txt gefunden" -ForegroundColor Green

# Prüfe ob Virtual Environment bereits existiert
if (Test-Path ".venv") {
    Write-Host "[OK] Virtual Environment bereits vorhanden" -ForegroundColor Green
} else {
    Write-Host "[INFO] Erstelle Virtual Environment..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Fehler beim Erstellen des Virtual Environment!" -ForegroundColor Red
        Write-Host "[DEBUG] Python-Version: $(python --version 2>&1)" -ForegroundColor Gray
        Write-Host "[DEBUG] Aktuelles Verzeichnis: $(Get-Location)" -ForegroundColor Gray
        exit 1
    }
    Write-Host "[OK] Virtual Environment erstellt" -ForegroundColor Green
}

# Aktiviere Virtual Environment
Write-Host "[INFO] Aktiviere Virtual Environment..." -ForegroundColor Yellow
& ".venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Fehler beim Aktivieren des Virtual Environment!" -ForegroundColor Red
    Write-Host "[DEBUG] Virtual Environment Pfad: $(Get-Location)\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
    exit 1
}
Write-Host "[OK] Virtual Environment aktiviert" -ForegroundColor Green

# Upgrade pip
Write-Host "[INFO] Upgrade pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Fehler beim Upgrade von pip, fahre trotzdem fort..." -ForegroundColor Yellow
}

# Installiere Python-Abhängigkeiten
Write-Host "[INFO] Installiere Python-Abhängigkeiten..." -ForegroundColor Yellow
Write-Host "[DEBUG] Installiere von: $(Get-Location)\requirements.txt" -ForegroundColor Gray
pip install -r requirements.txt --verbose
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Fehler beim Installieren der Python-Abhängigkeiten!" -ForegroundColor Red
    Write-Host "[DEBUG] Pip-Version: $(pip --version 2>&1)" -ForegroundColor Gray
    Write-Host "[DEBUG] Requirements-Inhalt:" -ForegroundColor Gray
    Get-Content requirements.txt | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    exit 1
}
Write-Host "[OK] Python-Abhängigkeiten installiert" -ForegroundColor Green

# Prüfe ob uvicorn installiert ist
Write-Host "[INFO] Prüfe uvicorn-Installation..." -ForegroundColor Yellow
try {
    uvicorn --version | Out-Null
    Write-Host "[OK] uvicorn gefunden" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Installiere uvicorn..." -ForegroundColor Yellow
    pip install uvicorn --verbose
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Fehler beim Installieren von uvicorn!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] uvicorn installiert" -ForegroundColor Green
}

# Frontend Setup
Write-Host "`n[SETUP] Frontend Setup..." -ForegroundColor Yellow
Write-Host "[INFO] Wechsle zu Frontend-Verzeichnis..." -ForegroundColor Cyan
Set-Location ../frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend-Verzeichnis nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Prüfe ob package.json existiert
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json nicht gefunden im Frontend-Verzeichnis!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] package.json gefunden" -ForegroundColor Green

# Installiere Node.js-Abhängigkeiten
Write-Host "[INFO] Installiere Node.js-Abhängigkeiten..." -ForegroundColor Yellow
Write-Host "[DEBUG] Installiere in: $(Get-Location)" -ForegroundColor Gray
npm install --verbose
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Fehler beim Installieren der Node.js-Abhängigkeiten!" -ForegroundColor Red
    Write-Host "[DEBUG] Node-Version: $(node --version 2>&1)" -ForegroundColor Gray
    Write-Host "[DEBUG] NPM-Version: $(npm --version 2>&1)" -ForegroundColor Gray
    Write-Host "[DEBUG] Package.json-Inhalt:" -ForegroundColor Gray
    Get-Content package.json | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    exit 1
}
Write-Host "[OK] Node.js-Abhängigkeiten installiert" -ForegroundColor Green

# Zurück zum Root-Verzeichnis
Set-Location ..

# Erstelle Start-Skripte
Write-Host "`n[INFO] Erstelle Start-Skripte..." -ForegroundColor Yellow

# Backend Start-Skript
$backendScript = @"
# PowerX Backend Start Script
Write-Host "[INFO] Starte PowerX Backend..." -ForegroundColor Green
Set-Location backend
& ".venv\Scripts\Activate.ps1"
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
"@
$backendScript | Out-File -FilePath "start-backend.ps1" -Encoding UTF8

# Frontend Start-Skript
$frontendScript = @"
# PowerX Frontend Start Script
Write-Host "[INFO] Starte PowerX Frontend..." -ForegroundColor Green
Set-Location frontend
npm run dev
"@
$frontendScript | Out-File -FilePath "start-frontend.ps1" -Encoding UTF8

# Vollständiges Start-Skript
$fullStartScript = @"
# PowerX Vollständiger Start Script
Write-Host "[INFO] Starte PowerX vollständig..." -ForegroundColor Green

# Starte Backend im Hintergrund
Write-Host "[INFO] Starte Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-File", "start-backend.ps1" -WindowStyle Normal

# Warte kurz
Start-Sleep -Seconds 3

# Starte Frontend
Write-Host "[INFO] Starte Frontend..." -ForegroundColor Yellow
& "start-frontend.ps1"
"@
$fullStartScript | Out-File -FilePath "start-powerx.ps1" -Encoding UTF8

Write-Host "[OK] Start-Skripte erstellt:" -ForegroundColor Green
Write-Host "   - start-backend.ps1 (Nur Backend)" -ForegroundColor Cyan
Write-Host "   - start-frontend.ps1 (Nur Frontend)" -ForegroundColor Cyan
Write-Host "   - start-powerx.ps1 (Beide zusammen)" -ForegroundColor Cyan

# Erfolgsmeldung
Write-Host "`n[SUCCESS] PowerX Setup erfolgreich abgeschlossen!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "`n[INFO] Starte PowerX automatisch..." -ForegroundColor Yellow
Write-Host ""

# Starte Backend im Hintergrund
Write-Host "[INFO] Starte Backend im Hintergrund..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location backend; & '.venv\Scripts\Activate.ps1'; uvicorn src.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal -PassThru

# Warte kurz damit Backend starten kann
Write-Host "[INFO] Warte 5 Sekunden bis Backend gestartet ist..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Starte Frontend
Write-Host "[INFO] Starte Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run dev

# Cleanup beim Beenden
Write-Host ""
Write-Host "[INFO] PowerX wurde gestoppt." -ForegroundColor Green
Write-Host "[INFO] Backend läuft auf: http://localhost:8000" -ForegroundColor Cyan
Write-Host "[INFO] Frontend läuft auf: http://localhost:5173" -ForegroundColor Cyan 