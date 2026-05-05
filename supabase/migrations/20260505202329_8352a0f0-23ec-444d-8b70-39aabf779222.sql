
-- Roles enum
create type public.app_role as enum ('super_admin', 'admin', 'member');

-- Churches
create table public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);
alter table public.churches enable row level security;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  church_id uuid references public.churches(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  church_id uuid references public.churches(id) on delete cascade,
  unique (user_id, role, church_id)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Churches policies
create policy "anyone authed can view churches" on public.churches for select to authenticated using (true);
create policy "super admin manage churches" on public.churches for all to authenticated
  using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

-- Profiles policies
create policy "view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "super admin view all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'super_admin'));

-- User_roles policies
create policy "view own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "super admin manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

-- Function: register with church code (atomic)
create or replace function public.register_with_church_code(_full_name text, _church_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare _church_id uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select id into _church_id from public.churches where code = upper(_church_code);
  if _church_id is null then raise exception 'Código de igreja inválido'; end if;
  insert into public.profiles(id, full_name, church_id) values (auth.uid(), _full_name, _church_id)
    on conflict (id) do update set full_name = excluded.full_name, church_id = excluded.church_id;
  insert into public.user_roles(user_id, role, church_id) values (auth.uid(), 'member', _church_id)
    on conflict do nothing;
  return _church_id;
end; $$;

-- Seed an initial church for testing
insert into public.churches(name, code) values ('Igreja Origo Central', 'ORIGO01');
