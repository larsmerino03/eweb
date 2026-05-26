# Portfolio – Lars Merino

Eine persönliche Portfolio-Website im Retro-Desktop-Stil (Windows 95/98 Ästhetik), entwickelt im Rahmen des Moduls **EWEB** an der **Berner Fachhochschule (BFH)**.

🌐 **Live:** [larsmerino03.github.io/eweb](https://larsmerino03.github.io/eweb/)

---

## Über die Seite

Die Website simuliert einen klassischen Desktop mit Fenstern, die sich öffnen, verschieben und schliessen lassen. Jedes Icon auf dem Desktop öffnet ein eigenes Fenster mit Inhalt.

| Fenster | Inhalt |
|---|---|
| **Über mich** | Kurze Vorstellung, Steckbrief, Profilbild |
| **Workouts** | Meine Strava-Aktivitäten (live aus einer JSON-Datei) |
| **Highlights** | Zwei ausgewählte Touren mit interaktiver Karte, Stats und Fotos |
| **Ausrüstung** | Mein Gravelbike (ARC8 Eero) und Padel-Schläger (NOX AT10 Genius) |
| **Playlist** | Meine aktuelle Musik-Playlist |
| **Wetter** | Aktuelles Wetter mit GPS-Erkennung |

---

## Features

- Desktop-Interface mit draggbaren Fenstern, Minimieren, Maximieren und Schliessen
- Taskbar mit Uhr und offenen Fenstern
- **Strava API Integration** – Aktivitäten werden als statische JSON-Datei eingebunden (kein Server nötig zum Anzeigen)
- Interaktive Routenkarten mit **Leaflet.js** + OpenStreetMap
- Strava-Fotos direkt aus der CDN eingebunden
- Filter-Funktion für Workouts (Sportart, Zeitraum, Suche)
- Vollständig statisch – läuft auf **GitHub Pages**

---

## Tech Stack

| Technologie | Verwendung |
|---|---|
| HTML / CSS / JavaScript | Gesamte Website (vanilla, kein Framework) |
| Node.js + Express | Lokales Script zum Datenabruf von Strava |
| Strava API v3 | Aktivitäten, Routen, Fotos |
| Leaflet.js | Interaktive Karten mit Google Encoded Polyline |
| OpenStreetMap | Kartenmaterial (kostenlos, keine API-Key nötig) |
| GitHub Pages | Hosting (statisch aus `/docs`) |
| dotenv | Lokale Umgebungsvariablen (.env) |

---

## Website anschauen – für Besucher

**Kein Setup, keine Installation, keine Accounts nötig.**

Die Website ist vollständig statisch und läuft direkt im Browser:

👉 **[larsmerino03.github.io/eweb](https://larsmerino03.github.io/eweb/)**

Alle Features sind sofort verfügbar:

- Desktop mit Fenstern öffnen → **Klick auf ein Icon**
- Workouts mit Filter → Fenster **WORKOUTS** öffnen
- Interaktive Streckenkarte → Fenster **HIGHLIGHTS** öffnen
- Ausrüstung und Specs → Fenster **AUSRÜSTUNG** öffnen

> Die Strava-Aktivitäten sind als statische Datei im Repository gespeichert und werden ohne Login geladen. Die interaktiven Karten laufen über OpenStreetMap und benötigen eine Internetverbindung. Täglich um 22:00 Uhr wird geschaut, ob weitere Workouts hochgeladen wurden und werden aktualisiert

---

## Projektstruktur

```
eweb/
├── docs/                        # Öffentliche Website (GitHub Pages)
│   ├── index.html               # Desktop-Startseite
│   ├── meine_workouts.html      # Strava Workouts
│   ├── highlights.html          # Highlight-Touren mit Karte
│   ├── ueber_mich.html          # Über mich
│   ├── musik.html               # Playlist
│   ├── ausruestung/
│   │   ├── gravel.html          # ARC8 Eero Specs
│   │   └── padel.html           # NOX AT10 Genius Specs
│   ├── assets/
│   │   ├── css/
│   │   │   ├── style.css        # Desktop-Styles
│   │   │   └── app.css          # Fenster-Inhalte Styles
│   │   ├── JS/
│   │   │   └── script.js        # Desktop-Logik (Fenster, Drag, Taskbar)
│   │   └── images/
│   └── data/
│       └── activities.json      # Strava-Aktivitäten (statisch gespeichert)
├── scripts/
│   └── fetch-activities.js      # Script: Strava-Daten abrufen und speichern
├── server.js                    # Lokaler OAuth-Server (nur für Setup)
├── package.json
├── .env                         # Geheim – wird nicht auf GitHub hochgeladen
└── .gitignore
```

---

## Live anschauen

Die Website ist direkt erreichbar unter:

```
https://larsmerino03.github.io/eweb/
```

Kein Server, kein Login, kein Setup nötig.

---

## Lokal ausführen (Entwicklung)

### Voraussetzungen

- [Node.js](https://nodejs.org/) installiert

### Dependencies installieren

```bash
npm install
```

### Website lokal öffnen

Da die Website statisch ist, kann sie direkt mit einem lokalen Webserver oder dem VS Code Live Server geöffnet werden. Die Datei `docs/index.html` ist der Einstiegspunkt.

---

## Strava API – Wie es funktioniert

Die Strava-Integration läuft in **zwei Phasen**:

### Phase 1 – Einmalige Authentifizierung (nur ich)

Da Strava OAuth erfordert, muss ich einmalig einen `refresh_token` holen:

```bash
node server.js
```

Dann im Browser:
```
http://127.0.0.1:3000/strava/login
```

Nach dem Login wird der `refresh_token` angezeigt → in `.env` eintragen:

```env
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REFRESH_TOKEN=...
```

### Phase 2 – Daten abrufen und speichern

```bash
npm run fetch
```

Dieses Script:
1. Holt mit dem `refresh_token` einen neuen Access Token (kein Browser nötig)
2. Lädt alle Aktivitäten von der Strava API herunter
3. Speichert sie als `docs/data/activities.json`

Die JSON-Datei wird dann auf GitHub committed → der Besucher sieht die Daten, ohne sich bei Strava anmelden zu müssen.

### Aktivitäten aktualisieren

Nach neuen Aktivitäten auf Strava:

```bash
npm run fetch
git add docs/data/activities.json
git commit -m "Aktivitäten aktualisiert"
git push
```

---

## Deployment (GitHub Pages)

Die Website wird automatisch aus dem `/docs`-Ordner auf dem `main`-Branch deployed.

**Einstellungen:** Repository → Settings → Pages → Branch: `main` / Folder: `/docs`

Jeder Push auf `main` löst automatisch einen neuen Deploy aus.

---

## Häufige Probleme

### Karte zeigt nichts an

Die interaktiven Karten (Leaflet.js) initialisieren sich erst wenn das Fenster geöffnet wird. Beim ersten Öffnen des Highlights-Fensters können die Karten 1–2 Sekunden brauchen zum Laden.

### Aktivitäten werden nicht angezeigt

Die Workouts-Seite liest `docs/data/activities.json`. Falls die Datei nicht existiert oder leer ist:

```bash
npm run fetch
```

### Bilder fehlen auf GitHub Pages

GitHub Pages läuft auf Linux → Dateinamen sind **case-sensitive**. Alle Dateinamen müssen klein geschrieben sein (z.B. `profile.jpg`, nicht `profile.JPG`).

---

## Autor

**Lars Merino**
Student Wirtschaftsinformatik – Berner Fachhochschule (BFH)
ICT-Projektmitarbeiter – Stadt Bern

[LinkedIn](https://ch.linkedin.com/in/lars-merino-b63625200)

---

## Modul

**EWEB** – Web Engineering
Berner Fachhochschule, Frühlingssemester 2026
