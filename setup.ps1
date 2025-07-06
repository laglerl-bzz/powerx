# PowerX Setup Script für Windows (PowerShell)
# Führt automatisch alle notwendigen Schritte aus, um PowerX zu installieren und zu starten

Write-Host "🚀 PowerX Setup Script für Windows" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Prüfe ob Python installiert ist
Write-Host "`n📋 Prüfe Python-Installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python gefunden: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installieren Sie Python 3.8+ von https://www.python.org/" -ForegroundColor Red
    Write-Host "Stellen Sie sicher, dass 'Add Python to PATH' aktiviert ist." -ForegroundColor Red
    exit 1
}

# Prüfe ob Node.js installiert ist
Write-Host "`n📋 Prüfe Node.js-Installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installieren Sie Node.js 16+ von https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Prüfe ob npm installiert ist
Write-Host "`n📋 Prüfe npm-Installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ npm gefunden: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm ist nicht installiert!" -ForegroundColor Red
    exit 1
}

# Backend Setup
Write-Host "`n🔧 Backend Setup..." -ForegroundColor Yellow
Set-Location backend

# Prüfe ob Virtual Environment bereits existiert
if (Test-Path ".venv") {
    Write-Host "✅ Virtual Environment bereits vorhanden" -ForegroundColor Green
} else {
    Write-Host "📦 Erstelle Virtual Environment..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Fehler beim Erstellen des Virtual Environment!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Virtual Environment erstellt" -ForegroundColor Green
}

# Aktiviere Virtual Environment
Write-Host "🔌 Aktiviere Virtual Environment..." -ForegroundColor Yellow
& ".venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fehler beim Aktivieren des Virtual Environment!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Virtual Environment aktiviert" -ForegroundColor Green

# Installiere Python-Abhängigkeiten
Write-Host "📦 Installiere Python-Abhängigkeiten..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fehler beim Installieren der Python-Abhängigkeiten!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python-Abhängigkeiten installiert" -ForegroundColor Green

# Prüfe ob uvicorn installiert ist
try {
    uvicorn --version | Out-Null
    Write-Host "✅ uvicorn gefunden" -ForegroundColor Green
} catch {
    Write-Host "📦 Installiere uvicorn..." -ForegroundColor Yellow
    pip install uvicorn
    Write-Host "✅ uvicorn installiert" -ForegroundColor Green
}

# Frontend Setup
Write-Host "`n🔧 Frontend Setup..." -ForegroundColor Yellow
Set-Location ../frontend

# Installiere Node.js-Abhängigkeiten
Write-Host "📦 Installiere Node.js-Abhängigkeiten..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fehler beim Installieren der Node.js-Abhängigkeiten!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js-Abhängigkeiten installiert" -ForegroundColor Green

# Zurück zum Root-Verzeichnis
Set-Location ..

# Erstelle Start-Skripte
Write-Host "`n📝 Erstelle Start-Skripte..." -ForegroundColor Yellow

# Backend Start-Skript
$backendScript = @"
# PowerX Backend Start Script
Write-Host "🚀 Starte PowerX Backend..." -ForegroundColor Green
Set-Location backend
& ".venv\Scripts\Activate.ps1"
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
"@
$backendScript | Out-File -FilePath "start-backend.ps1" -Encoding UTF8

# Frontend Start-Skript
$frontendScript = @"
# PowerX Frontend Start Script
Write-Host "🚀 Starte PowerX Frontend..." -ForegroundColor Green
Set-Location frontend
npm run dev
"@
$frontendScript | Out-File -FilePath "start-frontend.ps1" -Encoding UTF8

# Vollständiges Start-Skript
$fullStartScript = @"
# PowerX Vollständiger Start Script
Write-Host "🚀 Starte PowerX vollständig..." -ForegroundColor Green

# Starte Backend im Hintergrund
Write-Host "🔧 Starte Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-File", "start-backend.ps1" -WindowStyle Normal

# Warte kurz
Start-Sleep -Seconds 3

# Starte Frontend
Write-Host "🎨 Starte Frontend..." -ForegroundColor Yellow
& "start-frontend.ps1"
"@
$fullStartScript | Out-File -FilePath "start-powerx.ps1" -Encoding UTF8

Write-Host "✅ Start-Skripte erstellt:" -ForegroundColor Green
Write-Host "   - start-backend.ps1 (Nur Backend)" -ForegroundColor Cyan
Write-Host "   - start-frontend.ps1 (Nur Frontend)" -ForegroundColor Cyan
Write-Host "   - start-powerx.ps1 (Beide zusammen)" -ForegroundColor Cyan

# Erfolgsmeldung
Write-Host "`n🎉 PowerX Setup erfolgreich abgeschlossen!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "`n📋 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "1. Führen Sie '.\start-powerx.ps1' aus, um beide Services zu starten" -ForegroundColor White
Write-Host "2. Öffnen Sie http://localhost:5173 im Browser" -ForegroundColor White
Write-Host "3. Backend API ist unter http://localhost:8000 verfügbar" -ForegroundColor White
Write-Host "`n💡 Tipps:" -ForegroundColor Yellow
Write-Host "- Verwenden Sie '.\start-backend.ps1' für nur das Backend" -ForegroundColor White
Write-Host "- Verwenden Sie '.\start-frontend.ps1' für nur das Frontend" -ForegroundColor White
Write-Host "- Drücken Sie Ctrl+C in den Terminal-Fenstern zum Beenden" -ForegroundColor White

Write-Host "`n🚀 Möchten Sie PowerX jetzt starten? (j/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "j" -or $response -eq "J" -or $response -eq "y" -or $response -eq "Y") {
    Write-Host "`n🚀 Starte PowerX..." -ForegroundColor Green
    & ".\start-powerx.ps1"
} 