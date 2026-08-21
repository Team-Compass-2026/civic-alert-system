-- Allow one role row per area so org accounts can be pinned to multiple
-- townships (the access layer already treats roleAreaIds as an array).
alter table public.user_roles
  drop constraint if exists user_roles_user_id_role_key;

-- One row per (user, role, area); NULL-area rows stay deduped by app logic.
create unique index if not exists user_roles_user_id_role_area_key
  on public.user_roles (user_id, role, area_id);
