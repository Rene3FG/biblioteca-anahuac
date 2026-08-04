-- Biblioteca Anáhuac — esquema de Supabase para favoritos y libros leídos recientemente.
-- Pegar una sola vez en el SQL Editor del proyecto de Supabase.
-- Los libros viven en src/data/books.json (no hay tabla de libros), así que book_id
-- es simplemente el entero `id` de ese JSON, sin FK.

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create table if not exists public.recently_read (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id integer not null,
  last_read_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

alter table public.favorites enable row level security;
alter table public.recently_read enable row level security;

create policy "favorites: select own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites: insert own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites: delete own" on public.favorites
  for delete using (auth.uid() = user_id);

create policy "recently_read: select own" on public.recently_read
  for select using (auth.uid() = user_id);
create policy "recently_read: insert own" on public.recently_read
  for insert with check (auth.uid() = user_id);
create policy "recently_read: update own" on public.recently_read
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Función para el Auth Hook "Before User Created": rechaza signups fuera de @anahuac.mx.
-- Activar en Authentication → Hooks → "Before User Created" apuntando a esta función.
create or replace function public.check_anahuac_domain(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  user_email text;
begin
  user_email := event->'user'->>'email';
  if lower(split_part(user_email, '@', 2)) <> 'anahuac.mx' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Solo se permiten correos institucionales @anahuac.mx'
      )
    );
  end if;
  return jsonb_build_object();
end;
$$;

revoke execute on function public.check_anahuac_domain from public, anon, authenticated;
grant execute on function public.check_anahuac_domain to supabase_auth_admin;
