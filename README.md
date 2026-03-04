# EWEB

# Portfolio Desktop – mit Strava Workouts

Dieses Projekt ist eine Desktop-artige Portfolio Webseite mit Strava Integration.
Die Workouts werden direkt über die Strava API geladen.

---

VORAUSSETZUNGEN

Installiert sein muss:

Node.js

Prüfen mit:

node -v

---

ORDNERSTRUKTUR

Der Projektordner muss so aussehen:

eweb/
│
├── server.js
├── package.json
├── .env
│
└── public/
├── index.html
├── meine_workouts.html
├── ueber_mich.html
├── highlights.html
├── musik.html
│
├── ausruestung/
│ ├── gravel.html
│ └── padel.html
│
└── assets/
├── css/style.css
├── js/script.js
└── images/

---

1. .env DATEI ERSTELLEN

Im gleichen Ordner wie server.js eine Datei erstellen:

.env

Inhalt:

STRAVA_CLIENT_ID=208023
STRAVA_CLIENT_SECRET=DEIN_GEHEIMER_CLIENTSCHLUESSEL

Wichtig:

Die .env Datei darf nicht im public Ordner liegen.

---

2. DEPENDENCIES INSTALLIEREN

Terminal öffnen und in den Projektordner wechseln:

cd eweb

Dann installieren:

npm install express dotenv

Falls noch kein package.json existiert:

npm init -y

---

3. SERVER STARTEN

Im Projektordner im Terminal ausführen:

node server.js

Wenn alles funktioniert steht im Terminal:

Server läuft: http://127.0.0.1:3000
Strava verbinden: http://127.0.0.1:3000/strava/login

Das Terminal muss geöffnet bleiben.

---

4. STRAVA VERBINDEN

Im Browser öffnen:

http://127.0.0.1:3000/strava/login

Dann:

1. Strava Login
2. Zugriff erlauben
3. Danach erscheint:

Strava verbunden
Scope: read,activity:read

---

5. WEBSITE ÖFFNEN

Die Seite darf NICHT über Live Server oder Doppelklick geöffnet werden.

Richtig ist:

http://127.0.0.1:3000/index.html

Dort erscheint der Desktop mit den Fenstern.

---

6. WORKOUTS TESTEN

Direkt im Browser öffnen:

http://127.0.0.1:3000/api/activities

Es sollte eine JSON Liste mit Strava Aktivitäten erscheinen.

---

BEISPIELE

Nur Rides:

http://127.0.0.1:3000/api/activities?type=Ride

Suche nach Aktivität:

http://127.0.0.1:3000/api/activities?q=padel

Letzte 90 Tage:

http://127.0.0.1:3000/api/activities?days=90

---

7. HÄUFIGE FEHLER

SEITE LÄDT NICHT

Server läuft nicht.

Lösung:

node server.js

---

WORKOUTS ZEIGEN NUR "LADE..."

Die Seite wurde nicht über den Node Server geöffnet.

Richtig:

http://127.0.0.1:3000/index.html

---

STRAVA TOKEN FEHLT

Nach einem Server Neustart muss Strava erneut verbunden werden:

http://127.0.0.1:3000/strava/login

---

SERVER STOPPEN

Im Terminal:

CTRL + C
