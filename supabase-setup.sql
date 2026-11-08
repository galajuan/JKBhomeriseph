-- JKB Homerise PH: run this ONCE in Supabase > SQL Editor > New query > Run.
-- It creates the table the website reads, the admin list, the photo bucket, and the
-- security rules (only people in the admins table can change anything).

-- 1) Tables -----------------------------------------------------------------
create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.admins (
  email text primary key
);
alter table public.site_content enable row level security;
alter table public.admins enable row level security;

-- 2) Who is an admin? (checks the signed-in user's email against the admins table)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 3) Rules for the website data ---------------------------------------------
drop policy if exists "anyone can read content" on public.site_content;
create policy "anyone can read content" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "admins insert content" on public.site_content;
create policy "admins insert content" on public.site_content
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins update content" on public.site_content;
create policy "admins update content" on public.site_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin sees own row" on public.admins;
create policy "admin sees own row" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 4) Photo bucket (public to read, only admins can upload or delete) ---------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "admins upload photos" on storage.objects;
create policy "admins upload photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos' and public.is_admin());

drop policy if exists "admins update photos" on storage.objects;
create policy "admins update photos" on storage.objects
  for update to authenticated using (bucket_id = 'photos' and public.is_admin());

drop policy if exists "admins delete photos" on storage.objects;
create policy "admins delete photos" on storage.objects
  for delete to authenticated using (bucket_id = 'photos' and public.is_admin());

-- 5) Add the admin(s). Edit the email, then run THIS part separately (new query):
--    insert into public.admins (email) values ('owner@gmail.com');
