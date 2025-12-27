create extension if not exists "pgcrypto";

create table if not exists public.task_registry (
  id uuid primary key default gen_random_uuid(),
  legacy_task_id text not null unique,
  created_at timestamptz default now()
);

alter table public.task_registry enable row level security;

create policy "task_registry read" on public.task_registry
  for select
  to authenticated
  using (true);

create policy "task_registry insert" on public.task_registry
  for insert
  to authenticated
  with check (true);

create table if not exists public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('gmail','microsoft')),
  email_address text,
  access_token_enc text not null,
  refresh_token_enc text,
  token_expires_at timestamptz,
  scopes text[],
  lugano_container_id text,
  is_paused boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, provider)
);

alter table public.email_accounts enable row level security;

create policy "email_accounts read" on public.email_accounts
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "email_accounts insert" on public.email_accounts
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "email_accounts update" on public.email_accounts
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "email_accounts delete" on public.email_accounts
  for delete
  to authenticated
  using (user_id = auth.uid());

create table if not exists public.email_thread_links (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.task_registry(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_thread_id text not null,
  subject text,
  participants jsonb,
  last_message_at timestamptz,
  last_snippet text,
  created_at timestamptz default now(),
  unique (user_id, provider, provider_thread_id)
);

alter table public.email_thread_links enable row level security;

create policy "email_thread_links read" on public.email_thread_links
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "email_thread_links insert" on public.email_thread_links
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "email_thread_links update" on public.email_thread_links
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "email_thread_links delete" on public.email_thread_links
  for delete
  to authenticated
  using (user_id = auth.uid());

create table if not exists public.email_messages_cache (
  id uuid primary key default gen_random_uuid(),
  thread_link_id uuid not null references public.email_thread_links(id) on delete cascade,
  provider_message_id text not null,
  sent_at timestamptz,
  "from" jsonb,
  "to" jsonb,
  cc jsonb,
  subject text,
  snippet text,
  body_html text,
  body_text text,
  created_at timestamptz default now()
);

create index if not exists email_messages_cache_thread_sent_idx
  on public.email_messages_cache (thread_link_id, sent_at);

alter table public.email_messages_cache enable row level security;

create policy "email_messages_cache read" on public.email_messages_cache
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.email_thread_links links
      where links.id = email_messages_cache.thread_link_id
        and links.user_id = auth.uid()
    )
  );

create policy "email_messages_cache insert" on public.email_messages_cache
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.email_thread_links links
      where links.id = email_messages_cache.thread_link_id
        and links.user_id = auth.uid()
    )
  );

create policy "email_messages_cache update" on public.email_messages_cache
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.email_thread_links links
      where links.id = email_messages_cache.thread_link_id
        and links.user_id = auth.uid()
    )
  );

create policy "email_messages_cache delete" on public.email_messages_cache
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.email_thread_links links
      where links.id = email_messages_cache.thread_link_id
        and links.user_id = auth.uid()
    )
  );

create table if not exists public.email_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.task_registry(id) on delete set null,
  thread_link_id uuid references public.email_thread_links(id) on delete set null,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

alter table public.email_activity_log enable row level security;

create policy "email_activity_log read" on public.email_activity_log
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "email_activity_log insert" on public.email_activity_log
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "email_activity_log update" on public.email_activity_log
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "email_activity_log delete" on public.email_activity_log
  for delete
  to authenticated
  using (user_id = auth.uid());

create table if not exists public.user_security_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  totp_secret_enc text,
  totp_enabled boolean not null default false,
  recovery_codes_hash text[],
  last_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_security_settings enable row level security;

create policy "user_security_settings read" on public.user_security_settings
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_security_settings insert" on public.user_security_settings
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_security_settings update" on public.user_security_settings
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "user_security_settings delete" on public.user_security_settings
  for delete
  to authenticated
  using (user_id = auth.uid());
