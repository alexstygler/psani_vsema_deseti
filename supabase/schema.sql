-- Run once in your Supabase project's SQL Editor. No service key in the app.
create table if not exists public.lehce_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.lehce_progress enable row level security;
revoke all on public.lehce_progress from anon;
grant select, insert, update, delete on public.lehce_progress to authenticated;
drop policy if exists "Read own progress" on public.lehce_progress;
create policy "Read own progress" on public.lehce_progress for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own progress" on public.lehce_progress;
create policy "Insert own progress" on public.lehce_progress for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own progress" on public.lehce_progress;
create policy "Update own progress" on public.lehce_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Delete own progress" on public.lehce_progress;
create policy "Delete own progress" on public.lehce_progress for delete to authenticated using ((select auth.uid()) = user_id);
