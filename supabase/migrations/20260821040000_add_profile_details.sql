-- Profile details: optional display name and contact phone.
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists phone text;
