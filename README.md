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

4. **Auth konfigurieren (optional schneller)**
   - In Supabase unter Auth → Settings ggf. „Email confirmations“ deaktivieren.

5. **Netlify deployen**
   - Build command: leer
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
   - Optional: `OPENAI_API_KEY` als Environment Variable setzen (für Bildgenerierung).

## Benutzer

- Für **Wolfgang** und **Konstantin** je ein Konto mit E‑Mail/Passwort über die UI erstellen.
- Neue Nutzer können jederzeit über „Neues Konto“ angelegt werden.

## Lokal entwickeln

```bash
npm run serve
```

App läuft dann unter `http://127.0.0.1:3000`.

## Hinweise

- Der gespeicherte Zustand ist für alle angemeldeten Nutzer gemeinsam.
- Gleichzeitige Änderungen folgen dem „last write wins“-Prinzip.
