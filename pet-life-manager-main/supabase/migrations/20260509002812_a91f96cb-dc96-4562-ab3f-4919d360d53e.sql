create table public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;

create policy "own_select" on public.game_saves for select to authenticated using (auth.uid() = user_id);
create policy "own_insert" on public.game_saves for insert to authenticated with check (auth.uid() = user_id);
create policy "own_update" on public.game_saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger game_saves_touch before update on public.game_saves
for each row execute function public.touch_updated_at();