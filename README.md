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
   - Optional: `OPENAI_IMAGE_MODEL` setzen (Standard: `dall-e-3`, `gpt-image-1` nur mit verifizierter Organisation).

## Gmail Integration (optional)

1. **Tabelle anlegen (SQL Editor)**

```sql
create table if not exists public.gmail_accounts (
  user_id uuid primary key references auth.users(id),
  email text,
  access_token text,
  refresh_token text,
  token_type text,
  scope text,
  expires_at timestamp with time zone,
  updated_at timestamp with time zone default now()
);

alter table public.gmail_accounts enable row level security;

create policy "gmail_accounts read" on public.gmail_accounts
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "gmail_accounts insert" on public.gmail_accounts
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "gmail_accounts update" on public.gmail_accounts
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "gmail_accounts delete" on public.gmail_accounts
  for delete
  to authenticated
  using (user_id = auth.uid());
```

2. **Google OAuth Client erstellen**
   - OAuth Client Typ: Web Application.
   - Authorized redirect URIs:
     - Lokal: `http://127.0.0.1:3000/`
     - Netlify: `https://<dein-netlify-domain>/`

3. **Environment Variablen setzen (Netlify + lokal)**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (muss exakt zu den Redirect URIs passen)
   - `SUPABASE_URL` und `SUPABASE_ANON_KEY` als Netlify Env (Functions nutzen diese).

4. **App nutzen**
   - In der App auf "Gmail verbinden" klicken.
   - In einer Aufgabe den Thread-Link oder die Thread-ID eintragen und anheften.
   - Es werden nur angeheftete Threads geladen; es gibt keinen Inbox-Listing-Endpunkt.

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
