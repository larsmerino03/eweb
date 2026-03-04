# Portfolio Desktop – mit Strava Integration

Dieses Projekt ist eine Desktop-artige Portfolio Webseite mit Strava Integration.  
Die Workouts werden direkt über die Strava API geladen und im Fenster **WORKOUTS** angezeigt.

---

# Voraussetzungen

Folgende Software muss installiert sein:

- Node.js

Prüfen mit:

```bash
node -v
```

---

# Ordnerstruktur

Der Projektordner sollte so aufgebaut sein:

```
eweb/
├── server.js
├── package.json
├── .env
└── public/
    ├── index.html
    ├── meine_workouts.html
    ├── ueber_mich.html
    ├── highlights.html
    ├── musik.html
    ├── ausruestung/
    │   ├── gravel.html
    │   └── padel.html
    └── assets/
        ├── css/
        │   └── style.css
        ├── js/
        │   └── script.js
        └── images/
```

---

# 1. .env Datei erstellen

Im gleichen Ordner wie `server.js` eine Datei erstellen:

```
.env
```

Inhalt:

```env
STRAVA_CLIENT_ID=208023
STRAVA_CLIENT_SECRET=DEIN_GEHEIMER_CLIENTSCHLUESSEL
```

Wichtig:

- Die `.env` Datei darf **nicht im public Ordner** liegen.
- Die `.env` Datei sollte **nicht auf GitHub hochgeladen werden**.

---

# 2. Dependencies installieren

Terminal öffnen und in den Projektordner wechseln:

```bash
cd eweb
```

Dann installieren:

```bash
npm install express dotenv
```

Falls noch kein `package.json` existiert:

```bash
npm init -y
```

---

# 3. Server starten

Im Projektordner im Terminal ausführen:

```bash
node server.js
```

Wenn alles funktioniert erscheint im Terminal:

```
Server läuft: http://127.0.0.1:3000
Strava verbinden: http://127.0.0.1:3000/strava/login
```

Das Terminal muss geöffnet bleiben.

---

# 4. Strava verbinden

Im Browser öffnen:

```
http://127.0.0.1:3000/strava/login
```

Dann:

1. Strava Login
2. Zugriff erlauben
3. Danach erscheint:

```
Strava verbunden
Scope: read,activity:read
```

---

# 5. Website öffnen

Die Seite darf **nicht über Live Server oder per Doppelklick** geöffnet werden.

Richtig ist:

```
http://127.0.0.1:3000/index.html
```

Dort erscheint der Desktop mit den Fenstern.

---

# 6. Workouts testen

Direkt im Browser öffnen:

```
http://127.0.0.1:3000/api/activities
```

Es sollte eine JSON Liste mit Strava Aktivitäten erscheinen.

---

# API Beispiele

Nur Rides anzeigen:

```
http://127.0.0.1:3000/api/activities?type=Ride
```

Suche nach Aktivität:

```
http://127.0.0.1:3000/api/activities?q=padel
```

Letzte 90 Tage:

```
http://127.0.0.1:3000/api/activities?days=90
```

---

# Häufige Fehler

## Seite lädt nicht

Der Server läuft nicht.

Lösung:

```bash
node server.js
```

---

## Workouts zeigen nur "LADE..."

Die Seite wurde nicht über den Node Server geöffnet.

Richtig:

```
http://127.0.0.1:3000/index.html
```

---

## Strava Token fehlt

Nach einem Server Neustart muss Strava erneut verbunden werden:

```
http://127.0.0.1:3000/strava/login
```

---

# Server stoppen

Im Terminal:

```bash
CTRL + C
```
