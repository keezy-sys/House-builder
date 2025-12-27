# House-builder

Gemeinsamer Hausplaner mit Login, Checklisten, Kommentaren und Bildideen.

## Hosting (Netlify + Supabase)

1. **Supabase Projekt erstellen**
2. **Tabelle anlegen (SQL Editor)**

```sql
create table if not exists public.house_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

alter table public.house_state enable row level security;

create policy "house_state read" on public.house_state
  for select
  to authenticated
  using (true);

create policy "house_state insert" on public.house_state
  for insert
  to authenticated
  with check (true);

create policy "house_state update" on public.house_state
  for update
  to authenticated
  using (true);
```

3. **Supabase Zugangsdaten setzen**
   - `config.js` ausfüllen (`SUPABASE_URL` und `SUPABASE_ANON_KEY`).

4. **Auth konfigurieren**
   - In Supabase unter Auth → URL Configuration „Site URL“ und Redirect URLs (lokal + Netlify) setzen.
   - Wenn Email confirmations aktiv sind: SMTP/E-Mail Provider konfigurieren (sonst keine Bestätigungs-Mail) oder Email confirmations deaktivieren.
   - Für Magic Links und Passwort-Reset ist ein E-Mail Provider + erlaubte Redirect-URL ebenfalls nötig.

5. **Netlify deployen**
   - Build command: leer
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
   - Optional: `OPENAI_API_KEY` als Environment Variable setzen (für Bildgenerierung).
   - Optional: `OPENAI_CHAT_MODEL` setzen, um ein Chat-Modell festzupinnen (ohne Wert oder mit `default`/`auto` nutzt die App den OpenAI-Standard).
   - Optional: `OPENAI_IMAGE_MODEL` setzen (Standard: `dall-e-3`, `gpt-image-1` nur mit verifizierter Organisation).

## E-Mail-Integration (Gmail + Outlook)

1. **Migrationen ausführen (SQL Editor)**
   - Datei: `supabase/migrations/20241227_email_integration.sql`

2. **OAuth Apps konfigurieren**
   - Redirect URIs (lokal + Netlify):
     - `APP_BASE_URL` (z.B. `http://localhost:3000/` und `https://<dein-netlify-domain>/`)
   - Google OAuth Client (Web Application).
   - Microsoft Entra App Registration (Web).

3. **Environment Variablen setzen (Netlify + lokal)**
   - `APP_BASE_URL`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
   - `EMAIL_TOKEN_ENCRYPTION_KEY` (32 Bytes, z.B. 64 Hex oder Base64)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (nur für Cron-Refresh)
   - `CRON_SECRET` (für den Refresh-Endpunkt)

4. **App nutzen**
   - In einer Aufgabe den Bereich „E-Mail-Integration“ öffnen.
   - Gmail/Outlook verbinden.
   - E-Mails in das Label/den Ordner „Lugano“ verschieben.
   - Unverknüpfte Threads erscheinen automatisch und lassen sich mit einem Klick verknüpfen.

5. **2FA aktivieren**
   - Über „Sicherheit“ die Zwei-Faktor-Authentifizierung einrichten.
   - QR-Code scannen, Code bestätigen, Recovery-Codes sichern.

6. **Datenschutz/Boundary**
   - Es werden nur E-Mails im Label/Ordner „Lugano“ abgefragt.
   - Tokens werden nur verschlüsselt gespeichert.

7. **Zugriff entziehen**
   - Google/Microsoft: App-Zugriff in den Account-Einstellungen entfernen.

8. **Cron Refresh (optional)**
   - Nur nötig, wenn Threads automatisch aktualisiert werden sollen.
   - Standardmäßig lädt die App E-Mails beim Öffnen/Reload und per manuellem Refresh.
   - Netlify Scheduled Function auf `/api/email/cron/refresh-lugano` einrichten.
   - Header: `Authorization: Bearer <CRON_SECRET>`.

## Benutzer

- Für **Wolfgang** und **Konstantin** je ein Konto mit E-Mail/Passwort über die UI erstellen.
- Danach in Supabase unter Auth -> Providers -> Email die Selbstregistrierung deaktivieren (Enable Email Signup aus).
- Neue Nutzer nur noch als Admin im Supabase Dashboard anlegen/einladen. Für spätere Öffnung der Registrierung den Toggle wieder aktivieren.
- Magic Links sind auf bestehende Nutzer beschränkt.

## Lokal entwickeln

```bash
npm run serve
```

App läuft dann unter `http://127.0.0.1:3000`.

## Hinweise

- Der gespeicherte Zustand ist für alle angemeldeten Nutzer gemeinsam.
- Gleichzeitige Änderungen folgen dem „last write wins“-Prinzip.

## QA Checkliste (E-Mail)

- Gmail verbinden -> Label „Lugano“ wird erstellt.
- Outlook verbinden -> Ordner „Lugano“ wird erstellt.
- E-Mail in „Lugano“ verschieben -> erscheint unter „Unverknüpfte Lugano-Threads“.
- Thread verknüpfen -> erscheint unter „Mit dieser Aufgabe verknüpft“.
- Thread öffnen -> Nachrichten werden angezeigt.
- Antworten senden -> bei abgelaufener Reauth erscheint 2FA/Passwort-Dialog.
- Audit-Log-Einträge existieren (CONNECT, LINK, VIEW_THREAD, REPLY_SENT, PAUSE).
- Pause -> keine Abfragen mehr, Unlinked-Liste bleibt leer.
