alter table public."constats-photos"
  add column if not exists latitude double precision null,
  add column if not exists longitude double precision null,
  add column if not exists captured_by text null;

create index if not exists constats_photos_id_projet_created_at_idx
  on public."constats-photos"(id_projet, created_at desc);
