#!/bin/bash

# PowerX Setup Script für Linux/macOS
# Führt automatisch alle notwendigen Schritte aus, um PowerX zu installieren und zu starten

echo "🚀 PowerX Setup Script für Linux/macOS"
echo "====================================="

# Prüfe ob Python installiert ist
echo ""
echo "📋 Prüfe Python-Installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo "✅ Python gefunden: $PYTHON_VERSION"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    echo "✅ Python gefunden: $PYTHON_VERSION"
    PYTHON_CMD="python"
else
    echo "❌ Python ist nicht installiert!"
    echo "Bitte installieren Sie Python 3.8+"
    echo "Ubuntu/Debian: sudo apt install python3 python3-pip python3-venv"
    echo "macOS: brew install python3"
    exit 1
fi

# Prüfe ob Node.js installiert ist
echo ""
echo "📋 Prüfe Node.js-Installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo "✅ Node.js gefunden: $NODE_VERSION"
else
    echo "❌ Node.js ist nicht installiert!"
    echo "Bitte installieren Sie Node.js 16+"
    echo "Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "macOS: brew install node"
    exit 1
fi

# Prüfe ob npm installiert ist
echo ""
echo "📋 Prüfe npm-Installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version 2>&1)
    echo "✅ npm gefunden: $NPM_VERSION"
else
    echo "❌ npm ist nicht installiert!"
    exit 1
fi

# Backend Setup
echo ""
echo "🔧 Backend Setup..."
cd backend

# Prüfe ob Virtual Environment bereits existiert
if [ -d ".venv" ]; then
    echo "✅ Virtual Environment bereits vorhanden"
else
    echo "📦 Erstelle Virtual Environment..."
    $PYTHON_CMD -m venv .venv
    if [ $? -ne 0 ]; then
        echo "❌ Fehler beim Erstellen des Virtual Environment!"
        exit 1
    fi
    echo "✅ Virtual Environment erstellt"
fi

# Aktiviere Virtual Environment
echo "🔌 Aktiviere Virtual Environment..."
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Aktivieren des Virtual Environment!"
    exit 1
fi
echo "✅ Virtual Environment aktiviert"

# Installiere Python-Abhängigkeiten
echo "📦 Installiere Python-Abhängigkeiten..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Installieren der Python-Abhängigkeiten!"
    exit 1
fi
echo "✅ Python-Abhängigkeiten installiert"

# Prüfe ob uvicorn installiert ist
if command -v uvicorn &> /dev/null; then
    echo "✅ uvicorn gefunden"
else
    echo "📦 Installiere uvicorn..."
    pip install uvicorn
    echo "✅ uvicorn installiert"
fi

# Frontend Setup
echo ""
echo "🔧 Frontend Setup..."
cd ../frontend

# Installiere Node.js-Abhängigkeiten
echo "📦 Installiere Node.js-Abhängigkeiten..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Installieren der Node.js-Abhängigkeiten!"
    exit 1
fi
echo "✅ Node.js-Abhängigkeiten installiert"

# Zurück zum Root-Verzeichnis
cd ..

# Erstelle Start-Skripte
echo ""
echo "📝 Erstelle Start-Skripte..."

# Backend Start-Skript
cat > start-backend.sh << 'EOF'
#!/bin/bash
# PowerX Backend Start Script
echo "🚀 Starte PowerX Backend..."
cd backend
source .venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
EOF

# Frontend Start-Skript
cat > start-frontend.sh << 'EOF'
#!/bin/bash
# PowerX Frontend Start Script
echo "🚀 Starte PowerX Frontend..."
cd frontend
npm run dev
EOF

# Vollständiges Start-Skript
cat > start-powerx.sh << 'EOF'
#!/bin/bash
# PowerX Vollständiger Start Script
echo "🚀 Starte PowerX vollständig..."

# Starte Backend im Hintergrund
echo "🔧 Starte Backend..."
./start-backend.sh &
BACKEND_PID=$!

# Warte kurz
sleep 3

# Starte Frontend
echo "🎨 Starte Frontend..."
./start-frontend.sh

# Cleanup beim Beenden
trap "kill $BACKEND_PID 2>/dev/null" EXIT
EOF

# Mache Skripte ausführbar
chmod +x start-backend.sh
chmod +x start-frontend.sh
chmod +x start-powerx.sh

echo "✅ Start-Skripte erstellt:"
echo "   - start-backend.sh (Nur Backend)"
echo "   - start-frontend.sh (Nur Frontend)"
echo "   - start-powerx.sh (Beide zusammen)"

# Erfolgsmeldung
echo ""
echo "🎉 PowerX Setup erfolgreich abgeschlossen!"
echo "====================================="
echo ""
echo "📋 Nächste Schritte:"
echo "1. Führen Sie './start-powerx.sh' aus, um beide Services zu starten"
echo "2. Öffnen Sie http://localhost:5173 im Browser"
echo "3. Backend API ist unter http://localhost:8000 verfügbar"
echo ""
echo "💡 Tipps:"
echo "- Verwenden Sie './start-backend.sh' für nur das Backend"
echo "- Verwenden Sie './start-frontend.sh' für nur das Frontend"
echo "- Drücken Sie Ctrl+C in den Terminal-Fenstern zum Beenden"

echo ""
echo "🚀 Möchten Sie PowerX jetzt starten? (j/n)"
read -r response
if [[ "$response" =~ ^[JjYy]$ ]]; then
    echo ""
    echo "🚀 Starte PowerX..."
    ./start-powerx.sh
fi 