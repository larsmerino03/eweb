import express from "express";
import dotenv from "dotenv";

// .env zuverlässig laden (auch in Cloud/OneDrive-Ordnern)
dotenv.config({ path: new URL("./.env", import.meta.url) });

const app = express();
const PORT = 3000;

// Immer 127.0.0.1 verwenden (nicht mit localhost mischen)
const BASE_URL = `http://127.0.0.1:${PORT}`;
const REDIRECT_URI = `${BASE_URL}/strava/callback`;

// Website aus /public ausliefern
app.use(express.static("public"));

// Env
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
  console.error("❌ Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET in .env");
  process.exit(1);
}

// Token Store (RAM) – für Portfolio ok, nach Neustart neu verbinden
let tokenStore = null;

/** Startseite (optional) */
app.get("/", (req, res) => {
  res.send(`
    <h3>✅ Server läuft</h3>
    <ul>
      <li><a href="/strava/login">Strava verbinden</a></li>
      <li><a href="/api/activities">Activities testen</a></li>
    </ul>
  `);
});

/** 1) Strava Login */
app.get("/strava/login", (req, res) => {
  // public activities lesen (ohne private)
  const scope = "read,activity:read";

  const authUrl =
    "https://www.strava.com/oauth/authorize" +
    `?client_id=${encodeURIComponent(STRAVA_CLIENT_ID)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&approval_prompt=force` +
    `&scope=${encodeURIComponent(scope)}`;

  console.log("AUTH URL:", authUrl);
  res.redirect(authUrl);
});

/** 2) Callback: code -> tokens */
app.get("/strava/callback", async (req, res) => {
  const code = req.query.code;
  const grantedScope = req.query.scope || "";

  console.log("Scope (from redirect):", grantedScope);

  if (!code) return res.status(400).send("Missing authorization code");

  // Ohne activity:read geht /athlete/activities nicht
  if (!grantedScope.includes("activity:read")) {
    return res.status(403).send(`
      <h3>❌ Keine Activity-Berechtigung</h3>
      <p>Aktueller Scope: <b>${grantedScope || "(leer)"}</b></p>
      <p>Du brauchst mindestens <b>activity:read</b>, sonst kann /api/activities nicht funktionieren.</p>
      <p>
        1) In Strava: Settings → My Apps/Applications → Revoke Access<br>
        2) Dann <a href="/strava/login">neu verbinden</a> und "Aktivitäten lesen" zulassen.
      </p>
    `);
  }

  const r = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  const data = await r.json();
  if (!r.ok) return res.status(500).send(JSON.stringify(data, null, 2));

  tokenStore = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  };

  res.send(`
    <h3>✅ Strava verbunden</h3>
    <p>Scope: <b>${grantedScope}</b></p>
    <p><a href="/api/activities">Activities testen</a></p>
    <p><a href="/index.html">Zur Website</a></p>
  `);
});

/** Access token holen/refreshen */
async function ensureAccessToken() {
  if (!tokenStore) throw new Error("Not connected. Visit /strava/login first.");

  const now = Math.floor(Date.now() / 1000);

  // noch gültig?
  if (tokenStore.expires_at > now + 60) return tokenStore.access_token;

  // refresh
  const r = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tokenStore.refresh_token,
    }),
  });

  const data = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(data, null, 2));

  tokenStore.access_token = data.access_token;
  tokenStore.refresh_token = data.refresh_token;
  tokenStore.expires_at = data.expires_at;

  return tokenStore.access_token;
}

/**
 * /api/activities (mit Filter)
 * Query:
 *  - days=30
 *  - type=Ride|Run|Workout...
 *  - q=suche im Namen
 *  - page=1
 *  - per_page=20 (max 50)
 */
app.get("/api/activities", async (req, res) => {
  try {
    const token = await ensureAccessToken();

    const days = Math.max(1, Number(req.query.days || 30));
    const after = Math.floor(Date.now() / 1000) - days * 24 * 3600;

    const page = Math.max(1, Number(req.query.page || 1));
    const per_page = Math.min(
      50,
      Math.max(1, Number(req.query.per_page || 20))
    );

    const url = new URL("https://www.strava.com/api/v3/athlete/activities");
    url.searchParams.set("after", String(after));
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(per_page));

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const activities = await r.json();
    if (!r.ok) return res.status(r.status).json(activities);

    const type = (req.query.type || "").trim(); // z.B. Ride
    const q = (req.query.q || "").trim().toLowerCase();

    const filtered = activities.filter((a) => {
      const okType = !type || a.type === type;
      const okQ = !q || (a.name || "").toLowerCase().includes(q);
      return okType && okQ;
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft: ${BASE_URL}`);
  console.log(`🔗 Strava verbinden: ${BASE_URL}/strava/login`);
});
