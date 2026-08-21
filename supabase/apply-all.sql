-- ============================================================
-- WaterWatch — FULL RESET + reinstall (migrations + seed).
-- Wipes the public schema (demo data only!) then applies
-- everything from scratch. Run ONCE in the SQL editor.
-- ============================================================

drop schema if exists public cascade;
create schema public;

-- pgcrypto: required for demo-account password hashing.
create extension if not exists pgcrypto schema extensions;


-- ============================================================
-- MIGRATION: 20260820084559_0dbe3177-646a-42b5-87bc-840bd3053104.sql
-- ============================================================

CREATE TYPE public.report_type AS ENUM (
  'unsafe_water','sewage','flooding','broken_infrastructure','sanitation','illness_cluster','other'
);
CREATE TYPE public.risk_level AS ENUM ('LOW','MODERATE','HIGH','CRITICAL');
CREATE TYPE public.verification_value AS ENUM ('confirm','dispute');

CREATE TABLE public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  township text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  radius_m integer NOT NULL DEFAULT 1500,
  base_score integer NOT NULL DEFAULT 0,
  trend_pct integer NOT NULL DEFAULT 0,
  baseline_reports integer NOT NULL DEFAULT 0,
  components jsonb NOT NULL DEFAULT '{}'::jsonb,
  baseline_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.areas TO anon;
GRANT SELECT ON public.areas TO authenticated;
GRANT ALL ON public.areas TO service_role;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Areas are publicly readable" ON public.areas FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.report_type NOT NULL,
  description text,
  when_happened text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  photo_url text,
  is_anonymous boolean NOT NULL DEFAULT true,
  anon_token text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reports_created_at_idx ON public.reports (created_at DESC);
CREATE INDEX reports_area_idx ON public.reports (area_id);

GRANT SELECT, INSERT ON public.reports TO anon;
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports are publicly readable" ON public.reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can file a report" ON public.reports FOR INSERT TO anon, authenticated WITH CHECK (status = 'open');

CREATE TABLE public.verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  value public.verification_value NOT NULL,
  anon_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_id, anon_token)
);

GRANT SELECT, INSERT ON public.verifications TO anon;
GRANT SELECT, INSERT ON public.verifications TO authenticated;
GRANT ALL ON public.verifications TO service_role;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verifications are publicly readable" ON public.verifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can verify a report" ON public.verifications FOR INSERT TO anon, authenticated WITH CHECK (length(anon_token) BETWEEN 8 AND 100);

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level public.risk_level NOT NULL,
  kind text NOT NULL DEFAULT 'update',
  title text NOT NULL,
  body text NOT NULL,
  advice text,
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.alerts TO anon;
GRANT SELECT ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts are publicly readable" ON public.alerts FOR SELECT TO anon, authenticated USING (true);

CREATE VIEW public.v_area_risk
WITH (security_invoker = true) AS
SELECT
  a.id AS area_id,
  a.slug,
  a.name,
  a.township,
  a.lat,
  a.lng,
  a.radius_m,
  LEAST(100, a.base_score + 2 * COALESCE(live.new_reports, 0))::int AS score,
  (CASE
    WHEN LEAST(100, a.base_score + 2 * COALESCE(live.new_reports, 0)) >= 85 THEN 'CRITICAL'
    WHEN LEAST(100, a.base_score + 2 * COALESCE(live.new_reports, 0)) >= 67 THEN 'HIGH'
    WHEN LEAST(100, a.base_score + 2 * COALESCE(live.new_reports, 0)) >= 34 THEN 'MODERATE'
    ELSE 'LOW'
  END)::public.risk_level AS level,
  a.trend_pct,
  a.components,
  (a.baseline_reports + COALESCE(live.new_reports, 0))::int AS reports_this_week
FROM public.areas a
LEFT JOIN LATERAL (
  SELECT count(*)::int AS new_reports
  FROM public.reports r
  WHERE r.area_id = a.id AND r.created_at > a.baseline_at
) live ON true;

GRANT SELECT ON public.v_area_risk TO anon, authenticated, service_role;

CREATE VIEW public.v_report_feed
WITH (security_invoker = true) AS
SELECT
  r.id,
  r.type,
  r.description,
  r.when_happened,
  r.lat,
  r.lng,
  r.photo_url,
  r.is_anonymous,
  r.created_at,
  r.status,
  r.area_id,
  a.name AS area_name,
  COALESCE(v.confirms, 0)::int AS confirms,
  COALESCE(v.disputes, 0)::int AS disputes
FROM public.reports r
LEFT JOIN public.areas a ON a.id = r.area_id
LEFT JOIN LATERAL (
  SELECT
    count(*) FILTER (WHERE value = 'confirm')::int AS confirms,
    count(*) FILTER (WHERE value = 'dispute')::int AS disputes
  FROM public.verifications vv WHERE vv.report_id = r.id
) v ON true;

GRANT SELECT ON public.v_report_feed TO anon, authenticated, service_role;

ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Storage lives in the storage schema, which survives public-schema resets,
-- so drop-then-create keeps this re-runnable.
DROP POLICY IF EXISTS "Report photos are readable" ON storage.objects;
CREATE POLICY "Report photos are readable" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'report-photos');
DROP POLICY IF EXISTS "Anyone can upload a report photo" ON storage.objects;
CREATE POLICY "Anyone can upload a report photo" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'report-photos');

INSERT INTO public.areas (slug, name, township, lat, lng, radius_m, base_score, trend_pct, baseline_reports, components) VALUES
('hlaing-tharyar','Hlaing Tharyar','Yangon West',16.8720,96.0680,2600,82,41,23,
 '{"water":{"label":"Water quality reports","score":88,"detail":"9 unsafe-water reports in 7 days, 6 confirmed by neighbors"},"sanitation":{"label":"Sanitation","score":74,"detail":"Sewage overflow near the market confirmed by 3 residents"},"illness":{"label":"Illness signals","score":80,"detail":"Diarrhea cluster reported after last week flooding"},"flooding":{"label":"Flooding","score":69,"detail":"Street flooding in two low-lying lanes"}}'::jsonb),
('thaketa','Thaketa','Yangon East',16.7960,96.2280,2100,61,22,12,
 '{"water":{"label":"Water quality reports","score":66,"detail":"Oily canal water reported near the jetty"},"sanitation":{"label":"Sanitation","score":58,"detail":"Public toilet closed and overflowing"},"illness":{"label":"Illness signals","score":41,"detail":"No confirmed cluster this week"},"flooding":{"label":"Flooding","score":63,"detail":"Drain blockage during heavy rain"}}'::jsonb),
('south-dagon','South Dagon','Yangon East',16.8380,96.2470,2400,54,12,8,
 '{"water":{"label":"Water quality reports","score":57,"detail":"Community well reported dirty"},"sanitation":{"label":"Sanitation","score":44,"detail":"Two sanitation complaints, unconfirmed"},"illness":{"label":"Illness signals","score":33,"detail":"No illness signals this week"},"flooding":{"label":"Flooding","score":61,"detail":"Low-lying lane flooded after rain"}}'::jsonb),
('north-dagon','North Dagon','Yangon East',16.9060,96.2130,2200,31,-4,4,
 '{"water":{"label":"Water quality reports","score":36,"detail":"One broken water pipe reported"},"sanitation":{"label":"Sanitation","score":24,"detail":"No sanitation reports this week"},"illness":{"label":"Illness signals","score":18,"detail":"No illness signals this week"},"flooding":{"label":"Flooding","score":27,"detail":"No flooding reported"}}'::jsonb),
('insein','Insein','Yangon North',16.8950,96.1000,2300,22,0,2,
 '{"water":{"label":"Water quality reports","score":19,"detail":"No water quality reports this week"},"sanitation":{"label":"Sanitation","score":38,"detail":"Open sewage reported near a school"},"illness":{"label":"Illness signals","score":12,"detail":"No illness signals this week"},"flooding":{"label":"Flooding","score":15,"detail":"No flooding reported"}}'::jsonb);

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT x.type::public.report_type, x.description, x.when_happened, x.lat, x.lng, a.id, true, now() - (x.age_hours || ' hours')::interval
FROM (VALUES
  ('unsafe_water','Tap water is brown and cloudy since this morning, smells like rust.','This morning',16.8735,96.0705,'hlaing-tharyar',3),
  ('sewage','Sewage overflowing onto the road beside the market, very strong smell.','Yesterday evening',16.8698,96.0651,'hlaing-tharyar',20),
  ('illness_cluster','Several households on our lane have diarrhea after last week flooding.','Past three days',16.8752,96.0662,'hlaing-tharyar',30),
  ('flooding','Street flooded knee-deep after last night rain, still not drained.','Last night',16.8681,96.0721,'hlaing-tharyar',14),
  ('unsafe_water','Canal water looks oily with a rainbow film on the surface.','Two days ago',16.7975,96.2301,'thaketa',44),
  ('sanitation','Public toilet near the bus stop is closed and overflowing.','Yesterday',16.7938,96.2255,'thaketa',26),
  ('unsafe_water','Community well water is dirty and has particles floating in it.','This week',16.8392,96.2489,'south-dagon',52),
  ('flooding','Low-lying lane behind the school floods every time it rains.','Yesterday',16.8361,96.2441,'south-dagon',34),
  ('broken_infrastructure','Water pipe broken at the corner, water running into the drain all day.','Two hours ago',16.9071,96.2148,'north-dagon',2),
  ('sanitation','Open sewage channel right next to the primary school gate.','Three days ago',16.8961,96.1024,'insein',70)
) AS x(type, description, when_happened, lat, lng, slug, age_hours)
JOIN public.areas a ON a.slug = x.slug;

INSERT INTO public.verifications (report_id, value, anon_token)
SELECT r.id, 'confirm', 'seed-token-' || r.id || '-' || g
FROM public.reports r
CROSS JOIN generate_series(1, 3) g
WHERE r.type IN ('unsafe_water','sewage','illness_cluster');

INSERT INTO public.verifications (report_id, value, anon_token)
SELECT r.id, 'dispute', 'seed-dispute-' || r.id
FROM public.reports r
WHERE r.type = 'flooding';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, created_at)
SELECT x.level::public.risk_level, x.kind, x.title, x.body, x.advice, a.id, now() - (x.age_hours || ' hours')::interval
FROM (VALUES
  ('HIGH','risk','Elevated risk detected near you','Multiple water-quality reports were filed in Hlaing Tharyar in the last 48 hours.','Use treated or boiled water for drinking and cooking until the situation is confirmed clear.','hlaing-tharyar',4),
  ('MODERATE','verify','Verify this report','A neighbor reported brown tap water about 1 km from you. Can you confirm what you see?',NULL,'hlaing-tharyar',9),
  ('MODERATE','update','Neighborhood update','Sewage overflow near the market has been confirmed by 3 neighbors.','Avoid the area with children and wash hands after any contact with standing water.','thaketa',28)
) AS x(level, kind, title, body, advice, slug, age_hours)
JOIN public.areas a ON a.slug = x.slug;

-- ============================================================
-- MIGRATION: 20260820200724_51fe7283-5542-4b25-bf1e-e2131fdf774f.sql
-- ============================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

CREATE INDEX profiles_user_id_idx ON public.profiles(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, area_id)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'area_id')::uuid
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- MIGRATION: 20260820200944_b84d0206-ef50-417b-8011-99e050bd9a02.sql
-- ============================================================

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- ============================================================
-- MIGRATION: 20260820201826_21e5236d-9621-4261-a228-3c834ed9eb60.sql
-- ============================================================

GRANT INSERT ON public.profiles TO supabase_auth_admin;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

ALTER FUNCTION public.handle_new_user() SECURITY INVOKER;

-- ============================================================
-- MIGRATION: 20260820211939_5d898ca7-b6ec-49af-a797-02eb451431f3.sql
-- ============================================================


INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, status, created_at) VALUES
('unsafe_water','Tap water smells of chlorine and looks cloudy since morning.','today', 16.8735, 96.0692, '4a648f23-206f-477a-9a3e-e1987c54b66a', true, 'open', now() - interval '3 hours'),
('sewage','Open drain overflowing next to the market lane.','today', 16.8702, 96.0655, '4a648f23-206f-477a-9a3e-e1987c54b66a', true, 'open', now() - interval '9 hours'),
('illness_cluster','Four households on our street report diarrhoea this week.','this_week', 16.8748, 96.0710, '4a648f23-206f-477a-9a3e-e1987c54b66a', true, 'open', now() - interval '1 day'),
('flooding','Ankle-deep standing water after last night rain.','yesterday', 16.7975, 96.2305, '053cc27c-bb86-4fcf-8499-6ac0cb94eb85', true, 'open', now() - interval '20 hours'),
('sanitation','Uncollected waste piling up near the school gate.','this_week', 16.7942, 96.2251, '053cc27c-bb86-4fcf-8499-6ac0cb94eb85', true, 'open', now() - interval '2 days'),
('broken_infrastructure','Community water pump handle broken, queue is long.','today', 16.8395, 96.2492, 'adec1e3a-c9b4-4eca-a2dd-26d0d316544a', true, 'open', now() - interval '5 hours'),
('unsafe_water','Water from the shared well tastes salty.','this_week', 16.8362, 96.2440, 'adec1e3a-c9b4-4eca-a2dd-26d0d316544a', true, 'open', now() - interval '3 days'),
('flooding','Drain blocked, road floods whenever it rains hard.','yesterday', 16.9071, 96.2158, '5496f048-2a85-4ceb-bd94-0f341443a569', true, 'open', now() - interval '1 day 4 hours'),
('sanitation','Public toilet at the bus stop has no water.','this_week', 16.9042, 96.2101, '5496f048-2a85-4ceb-bd94-0f341443a569', true, 'open', now() - interval '4 days'),
('other','Rubbish burning near the canal, strong smoke.','today', 16.8961, 96.1035, '5aac9148-1c7d-4cb9-aa98-6d0ccc7a2dd6', true, 'open', now() - interval '7 hours'),
('unsafe_water','Low pressure and brown water in the evenings.','this_week', 16.8934, 96.0972, '5aac9148-1c7d-4cb9-aa98-6d0ccc7a2dd6', true, 'open', now() - interval '2 days 6 hours');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at) VALUES
('CRITICAL','warning','Possible contamination in Hlaing Tharyar','Multiple unsafe-water and illness reports in the same ward within 24 hours.','Boil drinking water for at least one minute or use treated bottled water until further notice.','4a648f23-206f-477a-9a3e-e1987c54b66a','active', now() - interval '2 hours'),
('HIGH','warning','Flood risk rising in Thaketa','Standing water reported after heavy rain, with drains blocked in several lanes.','Avoid wading through floodwater and keep children away from open drains.','053cc27c-bb86-4fcf-8499-6ac0cb94eb85','active', now() - interval '11 hours'),
('MODERATE','update','Water pump outage in South Dagon','A community pump is out of service; nearby households report longer queues.','Store safe water in covered containers and share the alternative pump location with neighbours.','adec1e3a-c9b4-4eca-a2dd-26d0d316544a','active', now() - interval '1 day'),
('MODERATE','update','Drainage works planned in North Dagon','Local teams are clearing blocked drains reported by residents this week.','Report any new blockages so crews can prioritise them.','5496f048-2a85-4ceb-bd94-0f341443a569','active', now() - interval '2 days'),
('LOW','update','Insein conditions stable','No significant WASH hazards reported in the last week.','Keep reporting anything unusual â€” early reports keep the score accurate.','5aac9148-1c7d-4cb9-aa98-6d0ccc7a2dd6','active', now() - interval '3 days');

-- ============================================================
-- MIGRATION: 20260821013109_4d2daae3-2185-4d94-89d7-776ae19db79b.sql
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_area uuid;
BEGIN
  BEGIN
    v_area := NULLIF(NEW.raw_user_meta_data->>'area_id','')::uuid;
  EXCEPTION WHEN others THEN
    v_area := NULL;
  END;

  BEGIN
    INSERT INTO public.profiles (user_id, area_id)
    VALUES (NEW.id, v_area)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN others THEN
    INSERT INTO public.profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- ============================================================
-- MIGRATION: 20260821013212_bb50b98f-654e-415a-bc60-0e113ff8012f.sql
-- ============================================================

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- MIGRATION: 20260821013755_dc618674-c4b1-4760-96f9-ededca4e9570.sql
-- ============================================================

create type public.app_role as enum ('admin','org','citizen');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  area_id uuid references public.areas(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can view their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.role_area_ids(_user_id uuid)
returns setof uuid language sql stable security definer set search_path = public as $$
  select area_id from public.user_roles where user_id = _user_id and area_id is not null
$$;

revoke all on function public.has_role(uuid, public.app_role) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
revoke all on function public.role_area_ids(uuid) from public;
grant execute on function public.role_area_ids(uuid) to authenticated, service_role;

-- every new signup is a citizen by default
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'citizen')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_role on auth.users;
create trigger on_auth_user_created_role
after insert on auth.users
for each row execute function public.handle_new_user_role();

-- ============================================================
-- MIGRATION: 20260821020757_50d81092-bb56-43a8-bebc-27bd5ad71b61.sql
-- ============================================================

ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

DELETE FROM public.verifications
 WHERE report_id IN (SELECT id FROM public.reports WHERE anon_token IS NULL OR anon_token LIKE 'seed-%');
DELETE FROM public.reports WHERE anon_token IS NULL OR anon_token LIKE 'seed-%';
DELETE FROM public.alerts;

INSERT INTO public.areas (slug, name, township, lat, lng, radius_m, base_score, trend_pct, baseline_reports, components, baseline_at)
VALUES
('hlaing-tharyar','Hlaing Tharyar','Yangon West',16.8700,96.0400,2600,82,41,23,
 '{"water":{"label":"Water quality reports","score":88,"detail":"9 unsafe-water reports in 7 days, 6 confirmed by neighbours"},"sanitation":{"label":"Sanitation","score":74,"detail":"Sewage overflow near the market confirmed by 3 residents"},"flooding":{"label":"Flooding","score":69,"detail":"Street flooding in two low-lying lanes"},"illness":{"label":"Illness signals","score":80,"detail":"Diarrhoea cluster reported after last week flooding"}}'::jsonb, now() - interval '14 days'),
('shwepyithar','Shwepyithar','Yangon North',16.9450,96.0500,2400,76,33,18,
 '{"water":{"label":"Water quality reports","score":81,"detail":"Cloudy tube-well water reported across 4 wards"},"sanitation":{"label":"Sanitation","score":70,"detail":"Blocked drains along the industrial road"},"flooding":{"label":"Flooding","score":64,"detail":"Standing water after two nights of heavy rain"},"illness":{"label":"Illness signals","score":72,"detail":"Households reporting watery diarrhoea in ward 9"}}'::jsonb, now() - interval '14 days'),
('dagon-seikkan','Dagon Seikkan','Yangon East',16.8600,96.2500,2500,71,28,15,
 '{"water":{"label":"Water quality reports","score":74,"detail":"Vendor water reported with sediment"},"sanitation":{"label":"Sanitation","score":68,"detail":"Public toilet block overflowing near the bus stop"},"flooding":{"label":"Flooding","score":66,"detail":"Two lanes flooded, drainage still blocked"},"illness":{"label":"Illness signals","score":58,"detail":"Scattered diarrhoea reports, not yet clustered"}}'::jsonb, now() - interval '14 days'),
('thaketa','Thaketa','Yangon East',16.7900,96.2200,2000,68,22,12,
 '{"water":{"label":"Water quality reports","score":70,"detail":"Oily canal water reported near the jetty"},"sanitation":{"label":"Sanitation","score":62,"detail":"Public toilet closed and overflowing"},"flooding":{"label":"Flooding","score":63,"detail":"Drain blockage during heavy rain"},"illness":{"label":"Illness signals","score":45,"detail":"No confirmed cluster this week"}}'::jsonb, now() - interval '14 days'),
('south-dagon','South Dagon','Yangon East',16.8300,96.2200,2200,54,12,8,
 '{"water":{"label":"Water quality reports","score":57,"detail":"Community well reported dirty"},"sanitation":{"label":"Sanitation","score":44,"detail":"Two sanitation complaints, unconfirmed"},"flooding":{"label":"Flooding","score":61,"detail":"Low-lying lane flooded after rain"},"illness":{"label":"Illness signals","score":33,"detail":"No illness signals this week"}}'::jsonb, now() - interval '14 days'),
('north-okkalapa','North Okkalapa','Yangon North',16.9150,96.1700,2100,49,15,7,
 '{"water":{"label":"Water quality reports","score":52,"detail":"Intermittent supply, residents buying vendor water"},"sanitation":{"label":"Sanitation","score":46,"detail":"Waste piling near the market drain"},"flooding":{"label":"Flooding","score":40,"detail":"Minor pooling on side streets"},"illness":{"label":"Illness signals","score":38,"detail":"A few household diarrhoea reports"}}'::jsonb, now() - interval '14 days'),
('insein','Insein','Yangon North',16.9000,96.1000,2300,45,6,6,
 '{"water":{"label":"Water quality reports","score":42,"detail":"One discoloured-water report near the rail yard"},"sanitation":{"label":"Sanitation","score":51,"detail":"Open sewage reported near a school"},"flooding":{"label":"Flooding","score":33,"detail":"No flooding reported this week"},"illness":{"label":"Illness signals","score":26,"detail":"No illness signals this week"}}'::jsonb, now() - interval '14 days'),
('mingaladon','Mingaladon','Yangon North',16.9500,96.1400,2400,42,9,5,
 '{"water":{"label":"Water quality reports","score":45,"detail":"Two tube wells reported with odour"},"sanitation":{"label":"Sanitation","score":40,"detail":"Drain clearing requested by residents"},"flooding":{"label":"Flooding","score":36,"detail":"Light pooling after rain"},"illness":{"label":"Illness signals","score":24,"detail":"No illness signals this week"}}'::jsonb, now() - interval '14 days'),
('dala','Dala','Yangon South',16.7500,96.1500,2000,47,18,7,
 '{"water":{"label":"Water quality reports","score":55,"detail":"Households depending on vendor water report sediment"},"sanitation":{"label":"Sanitation","score":48,"detail":"Latrine overflow reported near the jetty"},"flooding":{"label":"Flooding","score":44,"detail":"Tidal flooding in riverside lanes"},"illness":{"label":"Illness signals","score":30,"detail":"Isolated diarrhoea reports"}}'::jsonb, now() - interval '14 days'),
('north-dagon','North Dagon','Yangon East',16.8900,96.2200,1800,31,-4,4,
 '{"water":{"label":"Water quality reports","score":36,"detail":"One broken water pipe reported"},"sanitation":{"label":"Sanitation","score":24,"detail":"No sanitation reports this week"},"flooding":{"label":"Flooding","score":27,"detail":"No flooding reported"},"illness":{"label":"Illness signals","score":18,"detail":"No illness signals this week"}}'::jsonb, now() - interval '14 days'),
('kamayut','Kamayut','Yangon West',16.8250,96.1300,1500,24,-2,3,
 '{"water":{"label":"Water quality reports","score":27,"detail":"Supply stable, one low-pressure report"},"sanitation":{"label":"Sanitation","score":22,"detail":"No sanitation reports this week"},"flooding":{"label":"Flooding","score":18,"detail":"No flooding reported"},"illness":{"label":"Illness signals","score":14,"detail":"No illness signals this week"}}'::jsonb, now() - interval '14 days'),
('bahan','Bahan','Yangon West',16.8000,96.1550,1500,21,0,2,
 '{"water":{"label":"Water quality reports","score":20,"detail":"No water quality reports this week"},"sanitation":{"label":"Sanitation","score":26,"detail":"One street-drain complaint"},"flooding":{"label":"Flooding","score":16,"detail":"No flooding reported"},"illness":{"label":"Illness signals","score":12,"detail":"No illness signals this week"}}'::jsonb, now() - interval '14 days')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, township = EXCLUDED.township, lat = EXCLUDED.lat, lng = EXCLUDED.lng,
  radius_m = EXCLUDED.radius_m, base_score = EXCLUDED.base_score, trend_pct = EXCLUDED.trend_pct,
  baseline_reports = EXCLUDED.baseline_reports, components = EXCLUDED.components, baseline_at = EXCLUDED.baseline_at;

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, anon_token, status, created_at)
SELECT
  t.typ::public.report_type,
  t.descr,
  CASE WHEN (g.i % 3) = 0 THEN 'Today' WHEN (g.i % 3) = 1 THEN 'Yesterday' ELSE 'Earlier this week' END,
  a.lat + (((g.i * 7) % 11) - 5) * 0.0030,
  a.lng + (((g.i * 5) % 11) - 5) * 0.0030,
  a.id,
  ((g.i % 4) <> 0),
  'seed-' || a.slug || '-' || g.i,
  'open',
  now() - (((g.i * 13) % 14) || ' days')::interval - (((g.i * 7) % 24) || ' hours')::interval
FROM public.areas a
JOIN (VALUES
  ('hlaing-tharyar',24,'high'),('shwepyithar',18,'high'),('dagon-seikkan',15,'high'),('thaketa',14,'high'),
  ('south-dagon',11,'mod'),('north-okkalapa',10,'mod'),('insein',9,'mod'),('mingaladon',8,'mod'),('dala',9,'mod'),
  ('north-dagon',6,'low'),('kamayut',5,'low'),('bahan',5,'low')
) AS cfg(slug, cnt, tier) ON cfg.slug = a.slug
JOIN LATERAL generate_series(1, cfg.cnt) AS g(i) ON true
JOIN LATERAL (
  SELECT s.typ,
    (CASE s.typ
      WHEN 'unsafe_water' THEN (ARRAY[
        'Tap water is brown and smells of mud this morning.',
        'Tube well water is cloudy, we are boiling before drinking.',
        'Vendor water delivered today had visible sediment at the bottom.',
        'Water from the community well tastes salty and looks murky.',
        'Supply came back after the cut but the first hour ran dirty.'])[(s.idx % 5) + 1]
      WHEN 'sewage' THEN (ARRAY[
        'Sewage is overflowing onto the lane behind the market.',
        'Drain next to the tea shop is blocked and spilling over.',
        'Waste water pooling in front of the housing block for three days.',
        'Septic leak near the school fence, strong smell all day.'])[(s.idx % 4) + 1]
      WHEN 'flooding' THEN (ARRAY[
        'Lane flooded knee-deep after last night rain, still not drained.',
        'Water entered ground floor houses on the low side of the street.',
        'Road under water near the bus stop, drainage blocked.'])[(s.idx % 3) + 1]
      WHEN 'illness_cluster' THEN (ARRAY[
        'Three people in our household have watery diarrhoea since yesterday.',
        'Several children in the ward are sick with diarrhoea this week.',
        'Neighbours went to the clinic with stomach illness after the flooding.'])[(s.idx % 3) + 1]
      WHEN 'sanitation' THEN (ARRAY[
        'Public toilet is closed and waste is piling outside.',
        'No hand-washing water at the market toilet block.',
        'Rubbish dumped beside the drain is blocking the flow.'])[(s.idx % 3) + 1]
      WHEN 'broken_infrastructure' THEN (ARRAY[
        'Main pipe broken at the corner, water leaking into the drain.',
        'Hand pump at the community well is broken since last week.',
        'Water tank cover is missing, open to rain and dust.'])[(s.idx % 3) + 1]
      ELSE (ARRAY[
        'Strong smell near the canal, unsure of the cause.',
        'Standing water around the neighbourhood is breeding mosquitoes.'])[(s.idx % 2) + 1]
    END) AS descr
  FROM (
    SELECT
      (CASE cfg.tier
        WHEN 'high' THEN (ARRAY['unsafe_water','unsafe_water','sewage','illness_cluster','flooding','unsafe_water','sanitation','sewage','broken_infrastructure','illness_cluster'])[(g.i % 10) + 1]
        WHEN 'mod'  THEN (ARRAY['unsafe_water','sewage','flooding','sanitation','broken_infrastructure','unsafe_water','other'])[(g.i % 7) + 1]
        ELSE (ARRAY['broken_infrastructure','sanitation','unsafe_water','other'])[(g.i % 4) + 1]
      END) AS typ,
      g.i AS idx
  ) s
) t ON true;

INSERT INTO public.verifications (report_id, value, anon_token, created_at)
SELECT r.id,
  CASE WHEN (v.k = 3 AND (abs(('x' || substr(md5(r.id::text), 1, 8))::bit(32)::int % 7) = 0)) THEN 'dispute' ELSE 'confirm' END::public.verification_value,
  'seed-verifier-' || v.k || '-' || substr(md5(r.id::text), 1, 12),
  r.created_at + (v.k || ' hours')::interval
FROM public.reports r
JOIN LATERAL generate_series(1, abs(('x' || substr(md5(r.id::text), 9, 8))::bit(32)::int % 4)) AS v(k) ON true
WHERE r.anon_token LIKE 'seed-%';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at, lat, lng)
SELECT x.level::public.risk_level, x.kind, x.title, x.body, x.advice, a.id, x.status,
       now() - (x.hours_ago || ' hours')::interval,
       a.lat + x.dlat, a.lng + x.dlng
FROM (VALUES
 ('HIGH','advisory','Water quality concerns near Hlaing Tharyar market','Nine unsafe-water reports in the last 7 days, six confirmed by other residents within 1 km.','Use boiled or treated water for drinking and cooking until the situation is clarified.','hlaing-tharyar','active',3,0.0040,-0.0035),
 ('HIGH','advisory','Diarrhoea signals rising in Hlaing Tharyar','Several households have reported watery diarrhoea after last week flooding.','Use ORS for anyone with diarrhoea and seek clinic care for signs of dehydration.','hlaing-tharyar','active',18,-0.0050,0.0045),
 ('HIGH','advisory','Sewage overflow reported in Shwepyithar ward 9','Blocked drains along the industrial road are spilling waste water into residential lanes.','Avoid contact with standing water and wash hands with soap after any contact.','shwepyithar','active',7,0.0035,0.0030),
 ('MODERATE','verification','Can you verify cloudy tube-well water?','A resident reported cloudy tube-well water near the school. Nearby residents can confirm or dispute.','Open the alert and confirm if you see the same problem.','shwepyithar','active',26,-0.0030,-0.0040),
 ('HIGH','advisory','Toilet block overflow in Dagon Seikkan','The public toilet block near the bus stop is overflowing and has been reported by three residents.','Avoid the area with young children and wash hands after passing through.','dagon-seikkan','active',11,0.0045,0.0020),
 ('MODERATE','advisory','Flooding still standing in Dagon Seikkan lanes','Two lanes remain flooded two days after rainfall; drainage is blocked.','Do not let children play in flood water and keep drinking water covered.','dagon-seikkan','active',40,-0.0035,0.0050),
 ('MODERATE','advisory','Canal water discolouration near Thaketa jetty','Residents report oily, discoloured water along the canal near the jetty.','Do not use canal water for washing food or utensils.','thaketa','active',15,0.0030,-0.0045),
 ('MODERATE','verification','Verification requested: blocked drain in Thaketa','One report of a blocked drain flooding the lane. Neighbours can confirm.','Confirm if you can see the same blockage.','thaketa','active',33,-0.0045,0.0025),
 ('MODERATE','advisory','Community well reported dirty in South Dagon','A shared well has been reported as dirty by two residents this week.','Boil water from the shared well before drinking.','south-dagon','active',22,0.0040,0.0035),
 ('MODERATE','advisory','Vendor water sediment reports in Dala','Riverside households report sediment in delivered vendor water.','Let water settle and boil before drinking; report again if it continues.','dala','active',30,-0.0040,-0.0030),
 ('LOW','update','Drain clearing completed in North Okkalapa','The drain blockage reported near the market has been cleared by the ward committee.',NULL,'north-okkalapa','resolved',48,0.0035,0.0035),
 ('MODERATE','advisory','Open sewage near an Insein school','A resident reported open sewage beside a school fence.','Keep children away from the affected stretch and wash hands with soap.','insein','monitoring',52,-0.0030,0.0040),
 ('LOW','update','Water pipe repaired in North Dagon','The broken main pipe reported last week has been repaired.',NULL,'north-dagon','resolved',60,0.0025,-0.0030),
 ('LOW','update','No unusual signals in Kamayut','No unusual water or sanitation signals in the last 7 days.',NULL,'kamayut','monitoring',20,0.0020,0.0020)
) AS x(level, kind, title, body, advice, slug, status, hours_ago, dlat, dlng)
JOIN public.areas a ON a.slug = x.slug;

CREATE OR REPLACE VIEW public.v_alert_feed
WITH (security_invoker = true) AS
SELECT
  al.id, al.level, al.kind, al.title, al.body, al.advice, al.status, al.created_at,
  al.area_id,
  COALESCE(al.lat, a.lat) AS lat,
  COALESCE(al.lng, a.lng) AS lng,
  a.slug AS area_slug,
  a.name AS area_name,
  a.township
FROM public.alerts al
LEFT JOIN public.areas a ON a.id = al.area_id;

GRANT SELECT ON public.v_alert_feed TO anon, authenticated, service_role;

CREATE OR REPLACE VIEW public.v_signal_trends
WITH (security_invoker = true) AS
WITH agg AS (
  SELECT
    r.type,
    count(*) FILTER (WHERE r.created_at > now() - interval '7 days')::int AS current_count,
    count(*) FILTER (WHERE r.created_at <= now() - interval '7 days' AND r.created_at > now() - interval '14 days')::int AS previous_count
  FROM public.reports r
  GROUP BY r.type
)
SELECT
  type,
  current_count,
  previous_count,
  CASE WHEN previous_count = 0 THEN NULL
       ELSE round(((current_count - previous_count)::numeric / previous_count) * 100)::int
  END AS trend_pct
FROM agg;

GRANT SELECT ON public.v_signal_trends TO anon, authenticated, service_role;

-- ============================================================
-- MIGRATION: 20260821020920_5da32f6c-0ee6-4d1c-9586-176273723663.sql
-- ============================================================

WITH n AS (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM public.reports WHERE anon_token LIKE 'seed-%'
)
UPDATE public.reports r
SET created_at = now()
  - ((CASE WHEN (n.rn % 10) < 7 THEN (n.rn % 7) ELSE 7 + (n.rn % 7) END) || ' days')::interval
  - (((n.rn * 7) % 24) || ' hours')::interval
FROM n WHERE n.id = r.id;

WITH n AS (
  SELECT v.id, row_number() OVER (ORDER BY v.id) AS rn, r.created_at AS rc
  FROM public.verifications v JOIN public.reports r ON r.id = v.report_id
  WHERE v.anon_token LIKE 'seed-verifier-%'
)
UPDATE public.verifications v
SET created_at = n.rc + ((n.rn % 6) + 1 || ' hours')::interval
FROM n WHERE n.id = v.id;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.role_area_ids(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM anon, authenticated;

-- ============================================================
-- MIGRATION: 20260821031500_setup_complete.sql
-- ============================================================

-- Migration: Setup completion â€” demo alerts seed + storage bucket
-- Idempotent: safe to re-run. Uses IF NOT EXISTS / WHERE NOT EXISTS guards.
-- Follows schema conventions from 20260820084559 (risk_level enum, alert columns, area UUIDs).

-- ============================================================
-- 1. Create the report-photos storage bucket (idempotent)
--    Policies for storage.objects already exist in the base migration.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Seed demo alerts (only if table is empty â€” idempotent)
--    Aligned with WaterWatch spec: neighborhood risk alerts,
--    flood / water-quality themes, Hlaing Tharyar HIGH risk.
--    area_id UUIDs match the seed areas from the base migration.
-- ============================================================
INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT
  x.level::public.risk_level,
  x.kind,
  x.title,
  x.body,
  x.advice,
  a.id,
  'active',
  now() - (x.age_hours || ' hours')::interval
FROM (VALUES
  ('HIGH','risk','Elevated water risk in Hlaing Tharyar',
   'Multiple unsafe-water reports filed in Hlaing Tharyar over the past 48 hours. Base risk score is 82/100 â€” HIGH.',
   'Use treated or boiled water for drinking and cooking until the situation is confirmed clear.',
   'hlaing-tharyar',2),
  ('HIGH','risk','Flood risk rising in Hlaing Tharyar',
   'Street flooding reported in low-lying lanes after heavy rain. Risk score elevated to HIGH (82/100).',
   'Avoid wading through floodwater and keep children away from open drains.',
   'hlaing-tharyar',8),
  ('MODERATE','update','Water quality improving in Thaketa',
   'Canal water near the jetty still shows oily film but fewer reports this week. Score 61/100 â€” MODERATE.',
   'Keep reporting anything unusual â€” early reports keep the score accurate.',
   'thaketa',18),
  ('CRITICAL','warning','Possible contamination in Hlaing Tharyar',
   'Multiple unsafe-water and illness-cluster reports in the same ward within 24 hours. Immediate action required.',
   'Boil drinking water for at least one minute or use treated bottled water until further notice.',
   'hlaing-tharyar',4)
) AS x(level, kind, title, body, advice, slug, age_hours)
JOIN public.areas a ON a.slug = x.slug
WHERE NOT EXISTS (SELECT 1 FROM public.alerts LIMIT 1);

-- ============================================================
-- MIGRATION: 20260821040000_add_profile_details.sql
-- ============================================================

-- Profile details: optional display name and contact phone.
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists phone text;

-- ============================================================
-- MIGRATION: 20260821050000_add_support_messages.sql
-- ============================================================

CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.support_messages TO anon;
GRANT SELECT, INSERT ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own messages" ON public.support_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Users can read their own messages" ON public.support_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION: 20260821051000_allow_multi_area_roles.sql

-- ============================================================
-- SEED: reports + alerts + demo accounts
-- ============================================================

-- WaterWatch full seed â€” idempotent (safe to re-run).
-- Sections: 1 reports Â· 2 alerts Â· 3 demo accounts for every role.
-- Requires areas to exist first (they are seeded by the base migrations).

-- ============================================================
-- SECTION 1: Reports
-- ============================================================
INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Tap water is brown and cloudy since morning', 'This morning', 16.8735, 96.0705, a.id, true, now() - interval '3 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Tap water is brown and cloudy since morning');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sewage'::public.report_type, 'Sewage overflowing onto road near the market', 'Yesterday', 16.8698, 96.0651, a.id, true, now() - interval '20 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Sewage overflowing onto road near the market');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'illness_cluster'::public.report_type, 'Several households have diarrhea after flooding', 'Past three days', 16.8752, 96.0662, a.id, true, now() - interval '30 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Several households have diarrhea after flooding');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'flooding'::public.report_type, 'Street flooded knee-deep after rain last night', 'Last night', 16.8681, 96.0721, a.id, true, now() - interval '14 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Street flooded knee-deep after rain last night');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Canal water looks oily near the jetty', 'Two days ago', 16.7975, 96.2301, a.id, true, now() - interval '44 hours'
FROM public.areas a WHERE a.slug = 'thaketa'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Canal water looks oily near the jetty');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sanitation'::public.report_type, 'Public toilet near bus stop is overflowing', 'Yesterday', 16.7938, 96.2255, a.id, true, now() - interval '26 hours'
FROM public.areas a WHERE a.slug = 'thaketa'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Public toilet near bus stop is overflowing');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Community well water is dirty with particles', 'This week', 16.8392, 96.2489, a.id, true, now() - interval '52 hours'
FROM public.areas a WHERE a.slug = 'south-dagon'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Community well water is dirty with particles');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'flooding'::public.report_type, 'Low lane behind school floods every rain', 'Yesterday', 16.8361, 96.2441, a.id, true, now() - interval '34 hours'
FROM public.areas a WHERE a.slug = 'south-dagon'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Low lane behind school floods every rain');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'broken_infrastructure'::public.report_type, 'Water pipe broken at corner leaking all day', 'Two hours ago', 16.9071, 96.2148, a.id, true, now() - interval '2 hours'
FROM public.areas a WHERE a.slug = 'north-dagon'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Water pipe broken at corner leaking all day');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sanitation'::public.report_type, 'Open sewage next to primary school gate', 'Three days ago', 16.8961, 96.1024, a.id, true, now() - interval '70 hours'
FROM public.areas a WHERE a.slug = 'insein'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Open sewage next to primary school gate');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Cloudy tube-well water near the school', 'Yesterday', 16.9465, 96.0515, a.id, true, now() - interval '8 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Cloudy tube-well water near the school');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sewage'::public.report_type, 'Blocked drains spilling into lanes', 'Today', 16.9435, 96.0485, a.id, true, now() - interval '5 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Blocked drains spilling into lanes');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'illness_cluster'::public.report_type, 'Several children sick with diarrhea in ward 9', 'This week', 16.9440, 96.0520, a.id, true, now() - interval '18 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Several children sick with diarrhea in ward 9');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Vendor water had visible sediment', 'Two days ago', 16.8615, 96.2515, a.id, true, now() - interval '11 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Vendor water had visible sediment');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sewage'::public.report_type, 'Toilet block near bus stop overflowing', 'Yesterday', 16.8585, 96.2485, a.id, true, now() - interval '22 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Toilet block near bus stop overflowing');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'flooding'::public.report_type, 'Two lanes flooded after drainage blocked', 'Last night', 16.8620, 96.2520, a.id, true, now() - interval '8 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Two lanes flooded after drainage blocked');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Intermittent supply forcing vendor water purchases', 'This week', 16.9165, 96.1715, a.id, true, now() - interval '12 hours'
FROM public.areas a WHERE a.slug = 'north-okkalapa'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Intermittent supply forcing vendor water purchases');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sanitation'::public.report_type, 'Waste piling near market drain', 'Yesterday', 16.9135, 96.1685, a.id, true, now() - interval '6 hours'
FROM public.areas a WHERE a.slug = 'north-okkalapa'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Waste piling near market drain');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sewage'::public.report_type, 'Tube wells with strange odour near school', 'Three days ago', 16.9515, 96.1415, a.id, true, now() - interval '14 hours'
FROM public.areas a WHERE a.slug = 'mingaladon'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Tube wells with strange odour near school');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Households depending on dirty vendor water', 'This week', 16.7515, 96.1515, a.id, true, now() - interval '20 hours'
FROM public.areas a WHERE a.slug = 'dala'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Households depending on dirty vendor water');

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'flooding'::public.report_type, 'Tidal flooding in riverside lanes', 'Yesterday', 16.7485, 96.1485, a.id, true, now() - interval '10 hours'
FROM public.areas a WHERE a.slug = 'dala'
  AND NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.area_id = a.id AND r.description = 'Tidal flooding in riverside lanes');

-- ============================================================
-- SECTION 2: Alerts
-- ============================================================
INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'CRITICAL'::public.risk_level, 'warning', 'Possible contamination in Hlaing Tharyar', 'Multiple unsafe-water and illness reports in the same ward.', 'Boil drinking water or use bottled water.', a.id, 'active', now() - interval '2 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Possible contamination in Hlaing Tharyar');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Water quality concerns near market', 'Nine water reports in 7 days, six confirmed by neighbors.', 'Use boiled or treated water for drinking.', a.id, 'active', now() - interval '3 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Water quality concerns near market');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Diarrhea signals rising in Hlaing Tharyar', 'Several households reported diarrhea after flooding.', 'Use ORS and seek clinic care for dehydration.', a.id, 'active', now() - interval '18 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Diarrhea signals rising in Hlaing Tharyar');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Sewage overflow in Shwepyithar ward 9', 'Blocked drains spilling waste into lanes.', 'Avoid contact with standing water.', a.id, 'active', now() - interval '7 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Sewage overflow in Shwepyithar ward 9');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'verification', 'Can you verify cloudy tube-well water?', 'A resident reported cloudy water near the school.', 'Open the alert to confirm.', a.id, 'active', now() - interval '26 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Can you verify cloudy tube-well water?');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Toilet block overflow in Dagon Seikkan', 'Public toilet block is overflowing.', 'Avoid the area with young children.', a.id, 'active', now() - interval '11 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Toilet block overflow in Dagon Seikkan');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Flooding standing in Dagon Seikkan lanes', 'Two lanes remain flooded after rainfall.', 'Do not let children play in flood water.', a.id, 'active', now() - interval '40 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Flooding standing in Dagon Seikkan lanes');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Canal water discolouration near Thaketa jetty', 'Oily discoloured water along the canal.', 'Do not use canal water for washing food.', a.id, 'active', now() - interval '15 hours'
FROM public.areas a WHERE a.slug = 'thaketa'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Canal water discolouration near Thaketa jetty');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Community well dirty in South Dagon', 'A shared well reported dirty by two residents.', 'Boil water before drinking.', a.id, 'active', now() - interval '22 hours'
FROM public.areas a WHERE a.slug = 'south-dagon'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Community well dirty in South Dagon');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Vendor water sediment in Dala', 'Riverside households report sediment in water.', 'Let water settle and boil before drinking.', a.id, 'active', now() - interval '30 hours'
FROM public.areas a WHERE a.slug = 'dala'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Vendor water sediment in Dala');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'LOW'::public.risk_level, 'update', 'Drain clearing completed in North Okkalapa', 'The drain blockage near the market has been cleared.', NULL, a.id, 'resolved', now() - interval '48 hours'
FROM public.areas a WHERE a.slug = 'north-okkalapa'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Drain clearing completed in North Okkalapa');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Open sewage near an Insein school', 'Open sewage reported beside a school fence.', 'Keep children away from the area.', a.id, 'monitoring', now() - interval '52 hours'
FROM public.areas a WHERE a.slug = 'insein'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Open sewage near an Insein school');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'LOW'::public.risk_level, 'update', 'Water pipe repaired in North Dagon', 'Broken main pipe has been repaired.', NULL, a.id, 'resolved', now() - interval '60 hours'
FROM public.areas a WHERE a.slug = 'north-dagon'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Water pipe repaired in North Dagon');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'LOW'::public.risk_level, 'update', 'No unusual signals in Kamayut', 'No unusual water or sanitation signals this week.', NULL, a.id, 'monitoring', now() - interval '20 hours'
FROM public.areas a WHERE a.slug = 'kamayut'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'No unusual signals in Kamayut');

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Elevated risk in Bahan ward', 'Multiple water-quality reports near pagoda road.', 'Use treated or boiled water until confirmed safe.', a.id, 'active', now() - interval '8 hours'
FROM public.areas a WHERE a.slug = 'bahan'
  AND NOT EXISTS (SELECT 1 FROM public.alerts x WHERE x.area_id = a.id AND x.title = 'Elevated risk in Bahan ward');

-- ============================================================
-- SECTION 3: Demo accounts â€” one per role (idempotent).
--   admin@waterwatch.dev   / WaterWatch2026!  â†’ sees EVERYTHING
--   org@waterwatch.dev     / WaterWatch2026!  â†’ org dashboard, pinned to
--                                             Hlaing Tharyar + Shwepyithar
--   citizen@waterwatch.dev / WaterWatch2026!  â†’ citizen app, home = Dala
-- The on_auth_user_created triggers auto-create profiles + citizen role;
-- extra roles are added explicitly below.
-- ============================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       u.email, extensions.crypt('WaterWatch2026!', extensions.gen_salt('bf')),
       now(), '{"provider":"email","providers":["email"]}'::jsonb,
       jsonb_build_object('display_name', u.display_name),
       now(), now()
FROM (VALUES
  ('admin@waterwatch.dev',   'Aung Kyaw (Admin)'),
  ('org@waterwatch.dev',     'Thida Win (Partner Org)'),
  ('citizen@waterwatch.dev', 'Su Su (Resident)')
) AS u(email, display_name)
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = u.email);

-- auth.identities row is required for email/password sign-in.
INSERT INTO auth.identities (user_id, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
SELECT au.id, 'email', jsonb_build_object('sub', au.id::text, 'email', au.email), now(), now(), now()
FROM auth.users au
WHERE au.email IN ('admin@waterwatch.dev', 'org@waterwatch.dev', 'citizen@waterwatch.dev')
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = au.id AND i.provider_id = 'email'
  );

-- Roles: admin gets admin; org gets org pinned to two townships; citizen
-- already comes from the signup trigger (explicit insert kept for safety).
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin' FROM auth.users au WHERE au.email = 'admin@waterwatch.dev'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id AND ur.role = 'admin'
  );

INSERT INTO public.user_roles (user_id, role, area_id)
SELECT au.id, 'org', a.id
FROM auth.users au
JOIN public.areas a ON a.slug IN ('hlaing-tharyar', 'shwepyithar')
WHERE au.email = 'org@waterwatch.dev'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id AND ur.role = 'org' AND ur.area_id = a.id
  );

INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'citizen' FROM auth.users au WHERE au.email = 'citizen@waterwatch.dev'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id AND ur.role = 'citizen'
  );

-- Home areas + display names on profiles.
UPDATE public.profiles p
SET area_id = a.id, display_name = 'Su Su (Resident)', updated_at = now()
FROM auth.users au, public.areas a
WHERE p.user_id = au.id AND au.email = 'citizen@waterwatch.dev' AND a.slug = 'dala';

UPDATE public.profiles p
SET display_name = 'Aung Kyaw (Admin)', updated_at = now()
FROM auth.users au
WHERE p.user_id = au.id AND au.email = 'admin@waterwatch.dev';

UPDATE public.profiles p
SET display_name = 'Thida Win (Partner Org)', updated_at = now()
FROM auth.users au
WHERE p.user_id = au.id AND au.email = 'org@waterwatch.dev';

-- ============================================================
-- Verify: Run this last
-- ============================================================
SELECT (SELECT count(*) FROM public.areas) AS areas,
       (SELECT count(*) FROM public.reports) AS reports,
       (SELECT count(*) FROM public.alerts) AS alerts,
       (SELECT count(*) FROM public.user_roles) AS roles,
       (SELECT string_agg(au.email || ':' || ur.role, ', ')
          FROM public.user_roles ur JOIN auth.users au ON au.id = ur.user_id) AS accounts;
