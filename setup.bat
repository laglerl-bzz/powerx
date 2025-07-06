@echo off
REM PowerX Setup Script für Windows (Batch)
REM Führt automatisch alle notwendigen Schritte aus, um PowerX zu installieren und zu starten

echo 🚀 PowerX Setup Script für Windows
echo =====================================

REM Prüfe ob Python installiert ist
echo.
echo 📋 Prüfe Python-Installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python ist nicht installiert!
    echo Bitte installieren Sie Python 3.8+ von https://www.python.org/
    echo Stellen Sie sicher, dass 'Add Python to PATH' aktiviert ist.
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python gefunden: %PYTHON_VERSION%
)

REM Prüfe ob Node.js installiert ist
echo.
echo 📋 Prüfe Node.js-Installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo Bitte installieren Sie Node.js 16+ von https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=1" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
    echo ✅ Node.js gefunden: %NODE_VERSION%
)

REM Prüfe ob npm installiert ist
echo.
echo 📋 Prüfe npm-Installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm ist nicht installiert!
    pause
    exit /b 1
) else (
    for /f "tokens=1" %%i in ('npm --version 2^>^&1') do set NPM_VERSION=%%i
    echo ✅ npm gefunden: %NPM_VERSION%
)

REM Backend Setup
echo.
echo 🔧 Backend Setup...
cd backend

REM Prüfe ob Virtual Environment bereits existiert
if exist ".venv" (
    echo ✅ Virtual Environment bereits vorhanden
) else (
    echo 📦 Erstelle Virtual Environment...
    python -m venv .venv
    if %errorlevel% neq 0 (
        echo ❌ Fehler beim Erstellen des Virtual Environment!
        pause
        exit /b 1
    )
    echo ✅ Virtual Environment erstellt
)

REM Aktiviere Virtual Environment
echo 🔌 Aktiviere Virtual Environment...
call .venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ❌ Fehler beim Aktivieren des Virtual Environment!
    pause
    exit /b 1
)
echo ✅ Virtual Environment aktiviert

REM Installiere Python-Abhängigkeiten
echo 📦 Installiere Python-Abhängigkeiten...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Fehler beim Installieren der Python-Abhängigkeiten!
    pause
    exit /b 1
)
echo ✅ Python-Abhängigkeiten installiert

REM Prüfe ob uvicorn installiert ist
uvicorn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installiere uvicorn...
    pip install uvicorn
    echo ✅ uvicorn installiert
) else (
    echo ✅ uvicorn gefunden
)

REM Frontend Setup
echo.
echo 🔧 Frontend Setup...
cd ..\frontend

REM Installiere Node.js-Abhängigkeiten
echo 📦 Installiere Node.js-Abhängigkeiten...
npm install
if %errorlevel% neq 0 (
    echo ❌ Fehler beim Installieren der Node.js-Abhängigkeiten!
    pause
    exit /b 1
)
echo ✅ Node.js-Abhängigkeiten installiert

REM Zurück zum Root-Verzeichnis
cd ..

REM Erstelle Start-Skripte
echo.
echo 📝 Erstelle Start-Skripte...

REM Backend Start-Skript
echo @echo off > start-backend.bat
echo REM PowerX Backend Start Script >> start-backend.bat
echo echo 🚀 Starte PowerX Backend... >> start-backend.bat
echo cd backend >> start-backend.bat
echo call .venv\Scripts\activate.bat >> start-backend.bat
echo uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 >> start-backend.bat

REM Frontend Start-Skript
echo @echo off > start-frontend.bat
echo REM PowerX Frontend Start Script >> start-frontend.bat
echo echo 🚀 Starte PowerX Frontend... >> start-frontend.bat
echo cd frontend >> start-frontend.bat
echo npm run dev >> start-frontend.bat

REM Vollständiges Start-Skript
echo @echo off > start-powerx.bat
echo REM PowerX Vollständiger Start Script >> start-powerx.bat
echo echo 🚀 Starte PowerX vollständig... >> start-powerx.bat
echo. >> start-powerx.bat
echo REM Starte Backend im Hintergrund >> start-powerx.bat
echo echo 🔧 Starte Backend... >> start-powerx.bat
echo start "PowerX Backend" cmd /k "start-backend.bat" >> start-powerx.bat
echo. >> start-powerx.bat
echo REM Warte kurz >> start-powerx.bat
echo timeout /t 3 /nobreak ^>nul >> start-powerx.bat
echo. >> start-powerx.bat
echo REM Starte Frontend >> start-powerx.bat
echo echo 🎨 Starte Frontend... >> start-powerx.bat
echo start-frontend.bat >> start-powerx.bat

echo ✅ Start-Skripte erstellt:
echo    - start-backend.bat (Nur Backend)
echo    - start-frontend.bat (Nur Frontend)
echo    - start-powerx.bat (Beide zusammen)

REM Erfolgsmeldung
echo.
echo 🎉 PowerX Setup erfolgreich abgeschlossen!
echo =====================================
echo.
echo 📋 Nächste Schritte:
echo 1. Führen Sie 'start-powerx.bat' aus, um beide Services zu starten
echo 2. Öffnen Sie http://localhost:5173 im Browser
echo 3. Backend API ist unter http://localhost:8000 verfügbar
echo.
echo 💡 Tipps:
echo - Verwenden Sie 'start-backend.bat' für nur das Backend
echo - Verwenden Sie 'start-frontend.bat' für nur das Frontend
echo - Schliessen Sie die Terminal-Fenster zum Beenden

echo.
set /p response="🚀 Möchten Sie PowerX jetzt starten? (j/n): "
if /i "%response%"=="j" goto start
if /i "%response%"=="y" goto start
goto end

:start
echo.
echo 🚀 Starte PowerX...
call start-powerx.bat

:end
pause 