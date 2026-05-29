alter table public.profiles
  add column if not exists created_by_admin_id uuid null references public.profiles(id) on delete set null,
  add column if not exists created_by_admin_email text null,
  add column if not exists created_by_admin_name text null;

create index if not exists profiles_created_by_admin_id_idx
  on public.profiles(created_by_admin_id);
