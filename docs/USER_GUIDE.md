# PowerX Benutzerhandbuch

## Willkommen bei PowerX

PowerX ist eine benutzerfreundliche Software zur Visualisierung und Analyse von Stromzählerdaten. Diese Anwendung wurde speziell für die Schweizer Energiewirtschaft entwickelt und unterstützt die Verarbeitung von sdat- und ESL-Dateien.

## Schnellstart

### 1. Anwendung starten

1. Öffnen Sie Ihren Webbrowser
2. Navigieren Sie zu: `http://localhost:5173`
3. Die PowerX-Anwendung wird geladen

### 2. Erste Schritte

1. **Daten hochladen**: Gehen Sie zur Upload-Seite
2. **Dateien auswählen**: Wählen Sie sdat- oder ESL-Dateien
3. **Daten visualisieren**: Betrachten Sie die Diagramme auf der Hauptseite

## Hauptfunktionen

### 📊 Datenvisualisierung

Die Hauptseite zeigt interaktive Diagramme Ihrer Stromdaten:

#### Zeitraum-Auswahl
- **Tag**: Detaillierte 15-Minuten-Intervalle
- **Woche**: Tägliche Übersicht
- **Monat**: Monatliche Zusammenfassung
- **Jahr**: Jährliche Übersicht

#### Preset-Auswahl
- **Standard**: Alle verfügbaren Daten anzeigen
- **Bezug**: Nur Strombezug (ID742)
- **Einspeisung**: Nur Einspeisung (ID735)
- **Hochtarif/Niedertarif**: Separate Anzeige für ESL-Daten

#### Diagramm-Interaktion
- **Hover**: Zeigt detaillierte Werte an
- **Zoom**: Vergrössern Sie bestimmte Bereiche
- **Export**: Laden Sie Daten als CSV oder JSON herunter

### 📁 Datei-Upload

#### Unterstützte Formate

**SDAT-Dateien** (Verbrauchswerte)
- 15-Minuten-Intervalle
- IDs: 742 (Bezug), 735 (Einspeisung)
- XML-Format

**ESL-Dateien** (Zählerstände)
- Monatliche Daten
- OBIS-Codes: 1-1:1.8.1/1.8.2 (Bezug), 1-1:2.8.1/2.8.2 (Einspeisung)
- XML-Format

#### Upload-Prozess

1. **Dateityp wählen**
   - Klicken Sie auf "SDAT" oder "ESL"
   - Die Auswahl bestimmt die Validierung

2. **Dateien hinzufügen**
   - **Drag & Drop**: Ziehen Sie Dateien in den markierten Bereich
   - **Dateiauswahl**: Klicken Sie auf "Dateien auswählen"

3. **Validierung**
   - Dateien werden automatisch auf Format geprüft
   - Fehlerhafte Dateien werden abgelehnt
   - Erfolgreiche Uploads werden bestätigt

4. **Verarbeitung**
   - Daten werden automatisch verarbeitet
   - Fortschritt wird angezeigt
   - Ergebnisse sind sofort verfügbar

### 🎨 Benutzeroberfläche

#### Dark/Light Mode
- Umschaltknopf oben rechts
- Einstellung wird gespeichert
- Automatische Anpassung aller Elemente

#### Responsive Design
- Optimiert für Desktop und Mobile
- Automatische Anpassung an Bildschirmgrösse
- Touch-freundliche Bedienung

#### Navigation
- **Hauptseite**: Datenvisualisierung
- **Upload**: Datei-Upload
- **Navbar**: Schnellnavigation

## Detaillierte Anleitung

### Schritt 1: Daten vorbereiten

#### SDAT-Dateien
- Stellen Sie sicher, dass die XML-Struktur korrekt ist
- Überprüfen Sie die DocumentIDs (ID742, ID735)
- Validieren Sie die Zeitstempel

#### ESL-Dateien
- Kontrollieren Sie die OBIS-Codes
- Überprüfen Sie die Monatsformate (YYYY-MM)
- Validieren Sie die Werte

### Schritt 2: Dateien hochladen

1. **Upload-Seite öffnen**
   - Klicken Sie auf "Upload" in der Navigation
   - Oder navigieren Sie zu `/upload`

2. **Dateityp auswählen**
   - Wählen Sie "SDAT" für Verbrauchswerte
   - Wählen Sie "ESL" für Zählerstände

3. **Dateien hinzufügen**
   - Ziehen Sie Dateien in den Upload-Bereich
   - Oder klicken Sie auf "Dateien auswählen"
   - Mehrere Dateien können gleichzeitig hochgeladen werden

4. **Upload starten**
   - Klicken Sie auf "Dateien hochladen"
   - Warten Sie auf die Verarbeitung
   - Überprüfen Sie die Erfolgsmeldung

### Schritt 3: Daten analysieren

1. **Zur Hauptseite navigieren**
   - Klicken Sie auf "Home" in der Navigation
   - Oder navigieren Sie zu `/`

2. **Zeitraum wählen**
   - Verwenden Sie die Tabs: Tag, Woche, Monat, Jahr
   - Die Auswahl filtert die Daten im Frontend (keine Backend-Anfrage)

3. **Preset auswählen**
   - Wählen Sie ein Preset für die Darstellung
   - "Standard" zeigt alle verfügbaren Daten
   - Spezifische Presets filtern die Anzeige

4. **Diagramm interpretieren**
   - **X-Achse**: Zeit
   - **Y-Achse**: Verbrauch/Einspeisung (kWh)
   - **Farben**: Verschiedene Datenquellen
   - **Legende**: Erklärung der Farben

### Schritt 4: Daten exportieren

1. **Export-Button verwenden**
   - Klicken Sie auf "Export" in der Chart-Steuerung
   - Wählen Sie zwischen CSV und JSON

2. **Datei herunterladen**
   - Die Datei wird automatisch heruntergeladen
   - Dateiname enthält Zeitraum und Format
   - Nur aktuell angezeigte Daten werden exportiert

## Dateninterpretation

### Verbrauchsdiagramm (SDAT)

#### Was wird angezeigt?
- **Bezug (ID742)**: Stromverbrauch vom Netz
- **Einspeisung (ID735)**: Stromrückspeisung ins Netz
- **Zeitachse**: 15-Minuten-Intervalle

#### Interpretation
- **Positive Werte**: Strombezug
- **Negative Werte**: Stromrückspeisung
- **Spitzen**: Hoher Verbrauch oder Einspeisung
- **Täler**: Niedriger Verbrauch

### Zählerstandsdiagramm (ESL)

#### Was wird angezeigt?
- **Hochtarif (HT)**: Stromverbrauch zu Spitzenzeiten
- **Niedertarif (NT)**: Stromverbrauch zu Schwachlastzeiten
- **Zeitachse**: Monatliche Werte

#### Interpretation
- **Kumulative Werte**: Gesamter Verbrauch seit Messbeginn
- **Steigung**: Verbrauchsrate
- **Trends**: Langfristige Verbrauchsentwicklung

## Fehlerbehebung

### Häufige Probleme

#### Upload-Fehler
**Problem**: "Ungültige XML-Datei"
- **Lösung**: Überprüfen Sie das XML-Format
- **Lösung**: Stellen Sie sicher, dass es sich um sdat/ESL-Dateien handelt

**Problem**: "Datei zu gross"
- **Lösung**: Teilen Sie grosse Dateien auf
- **Lösung**: Komprimieren Sie die Dateien

#### Anzeige-Fehler
**Problem**: "Keine Daten verfügbar"
- **Lösung**: Überprüfen Sie den gewählten Zeitraum
- **Lösung**: Laden Sie Daten hoch

**Problem**: Diagramm lädt nicht
- **Lösung**: Seite neu laden
- **Lösung**: Browser-Cache leeren

#### Performance-Probleme
**Problem**: Langsame Ladezeiten
- **Lösung**: Reduzieren Sie die Datenmenge
- **Lösung**: Verwenden Sie kleinere Zeiträume

### Support

Bei technischen Problemen:

1. **Browser-Konsole prüfen**
   - F12 drücken
   - Fehlermeldungen notieren

2. **Daten überprüfen**
   - XML-Format validieren
   - Dateigrösse prüfen

3. **Support kontaktieren**
   - Fehlermeldung dokumentieren
   - Schritte zur Reproduktion notieren

## Best Practices

### Datenqualität
- Verwenden Sie valide XML-Dateien
- Überprüfen Sie die Daten vor dem Upload
- Regelmässige Backups erstellen

### Arbeitsablauf
- Laden Sie zuerst SDAT-Dateien hoch
- Dann ESL-Dateien für Zählerstände
- Verwenden Sie konsistente Zeiträume

### Analyse
- Beginnen Sie mit der Monatsansicht
- Verwenden Sie Presets für spezifische Analysen
- Exportieren Sie wichtige Daten

## Glossar

**SDAT**: Schweizer Datenaustauschformat für Verbrauchswerte

**ESL**: Elektronischer Stromzähler für Zählerstände

**OBIS**: Object Identification System für Zählerdaten

**HT/NT**: Hochtarif/Niedertarif

**ID742**: Bezeichner für Strombezug

**ID735**: Bezeichner für Stromeinspeisung

## Updates und Änderungen

### Version 1.0
- Erste Veröffentlichung
- Grundlegende Visualisierung
- Upload-Funktionalität
- Export-Features

---

**Haben Sie Fragen?**  
Kontaktieren Sie das Entwicklungsteam oder erstellen Sie ein Issue im Repository. 