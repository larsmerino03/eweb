/**
 * Strava Aktivitäten lokal abrufen und als statische JSON-Datei speichern.
 * Ausführen: npm run fetch
 *
 * Voraussetzung: STRAVA_REFRESH_TOKEN in .env (einmalig über node server.js holen)
 */

import dotenv from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } =
  process.env;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
  console.error(
    "❌ Fehlende Umgebungsvariablen in .env:\n" +
      "   STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN\n\n" +
      "   → Einmalig node server.js starten und OAuth abschliessen,\n" +
      "     dann den angezeigten Refresh Token in .env eintragen."
  );
  process.exit(1);
}

async function getAccessToken() {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: STRAVA_REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Token-Fehler:", JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return { access_token: data.access_token, refresh_token: data.refresh_token };
}

async function fetchAllActivities(token) {
  const activities = [];
  let page = 1;
  const per_page = 100;

  while (true) {
    const url = new URL("https://www.strava.com/api/v3/athlete/activities");
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(per_page));

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("❌ API-Fehler:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    if (!Array.isArray(data) || data.length === 0) break;

    // Nur relevante Felder behalten (kleinere Datei)
    const slim = data.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      sport_type: a.sport_type,
      distance: a.distance,
      moving_time: a.moving_time,
      elapsed_time: a.elapsed_time,
      total_elevation_gain: a.total_elevation_gain,
      start_date: a.start_date,
      start_date_local: a.start_date_local,
      average_speed: a.average_speed,
      max_speed: a.max_speed,
      average_heartrate: a.average_heartrate,
      max_heartrate: a.max_heartrate,
      kudos_count: a.kudos_count,
    }));

    activities.push(...slim);
    console.log(`  Seite ${page}: ${data.length} Aktivitäten geladen`);

    if (data.length < per_page) break;
    page++;
  }

  return activities;
}

async function main() {
  console.log("🔑 Access Token holen…");
  const { access_token, refresh_token: newRefreshToken } = await getAccessToken();

  // Neuen Refresh Token an GitHub Actions übergeben (Strava rotiert ihn bei jedem Call)
  if (process.env.GITHUB_OUTPUT && newRefreshToken) {
    const { appendFileSync } = await import("fs");
    appendFileSync(process.env.GITHUB_OUTPUT, `new_refresh_token=${newRefreshToken}\n`);
    console.log("🔑 Neuer Refresh Token an GitHub Actions übergeben.");
  }

  console.log("📡 Aktivitäten von Strava laden…");
  const activities = await fetchAllActivities(access_token);

  const outDir = path.join(__dirname, "../docs/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "activities.json");

  const output = {
    generated_at: new Date().toISOString(),
    count: activities.length,
    activities,
  };

  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n✅ ${activities.length} Aktivitäten gespeichert → public/data/activities.json`);
  console.log("   Datei commiten und pushen, damit der Dozent sie sehen kann.");
}

main();
