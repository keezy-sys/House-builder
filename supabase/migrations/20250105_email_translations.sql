alter table public.email_messages_cache
  add column if not exists translations jsonb not null default '{}'::jsonb,
  add column if not exists detected_language text;

create unique index if not exists email_messages_cache_thread_provider_idx
  on public.email_messages_cache (thread_link_id, provider_message_id);
