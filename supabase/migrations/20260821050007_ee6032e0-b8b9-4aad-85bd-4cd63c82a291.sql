drop schema if exists public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
create extension if not exists pgcrypto schema extensions;

CREATE TYPE public.report_type AS ENUM ('unsafe_water','sewage','flooding','broken_infrastructure','sanitation','illness_cluster','other');
CREATE TYPE public.risk_level AS ENUM ('LOW','MODERATE','HIGH','CRITICAL');
CREATE TYPE public.verification_value AS ENUM ('confirm','dispute');
CREATE TYPE public.app_role AS ENUM ('admin','org','citizen');

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
GRANT SELECT ON public.areas TO anon, authenticated;
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
GRANT SELECT, INSERT ON public.reports TO anon, authenticated;
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
GRANT SELECT, INSERT ON public.verifications TO anon, authenticated;
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
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alerts TO anon, authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts are publicly readable" ON public.alerts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  display_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);
CREATE INDEX profiles_user_id_idx ON public.profiles(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX user_roles_user_id_role_area_key ON public.user_roles (user_id, role, area_id);
CREATE UNIQUE INDEX user_roles_user_id_role_null_area_key ON public.user_roles (user_id, role) WHERE area_id IS NULL;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.support_messages TO anon, authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own messages" ON public.support_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can read their own messages" ON public.support_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

CREATE OR REPLACE FUNCTION public.role_area_ids(_user_id uuid)
RETURNS setof uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select area_id from public.user_roles where user_id = _user_id and area_id is not null
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_area uuid;
BEGIN
  BEGIN
    v_area := NULLIF(NEW.raw_user_meta_data->>'area_id','')::uuid;
  EXCEPTION WHEN others THEN v_area := NULL;
  END;
  BEGIN
    INSERT INTO public.profiles (user_id, area_id) VALUES (NEW.id, v_area) ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN others THEN
    INSERT INTO public.profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  insert into public.user_roles (user_id, role) values (new.id, 'citizen')
  on conflict do nothing;
  return new;
end;
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
REVOKE ALL ON FUNCTION public.role_area_ids(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.role_area_ids(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_role() TO supabase_auth_admin;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE VIEW public.v_area_risk WITH (security_invoker = true) AS
SELECT
  a.id AS area_id, a.slug, a.name, a.township, a.lat, a.lng, a.radius_m,
  LEAST(100, a.base_score + 2 * COALESCE(live.new_reports, 0))::int AS score,
  (CASE
    WHEN LEAST(100, a.base_score + 2 * COALESCE(live.new_reports, 0)) >= 85 THEN 'CRITICAL'
    WHEN LEAST(100, a.base_score + 2 * COALESCE(live.new_reports, 0)) >= 67 THEN 'HIGH'
    WHEN LEAST(100, a.base_score + 2 * COALESCE(live.new_reports, 0)) >= 34 THEN 'MODERATE'
    ELSE 'LOW' END)::public.risk_level AS level,
  a.trend_pct, a.components,
  (a.baseline_reports + COALESCE(live.new_reports, 0))::int AS reports_this_week
FROM public.areas a
LEFT JOIN LATERAL (
  SELECT count(*)::int AS new_reports FROM public.reports r
  WHERE r.area_id = a.id AND r.created_at > a.baseline_at
) live ON true;
GRANT SELECT ON public.v_area_risk TO anon, authenticated, service_role;

CREATE VIEW public.v_report_feed WITH (security_invoker = true) AS
SELECT r.id, r.type, r.description, r.when_happened, r.lat, r.lng, r.photo_url,
  r.is_anonymous, r.created_at, r.status, r.area_id, a.name AS area_name,
  COALESCE(v.confirms, 0)::int AS confirms, COALESCE(v.disputes, 0)::int AS disputes
FROM public.reports r
LEFT JOIN public.areas a ON a.id = r.area_id
LEFT JOIN LATERAL (
  SELECT count(*) FILTER (WHERE value = 'confirm')::int AS confirms,
         count(*) FILTER (WHERE value = 'dispute')::int AS disputes
  FROM public.verifications vv WHERE vv.report_id = r.id
) v ON true;
GRANT SELECT ON public.v_report_feed TO anon, authenticated, service_role;

CREATE VIEW public.v_alert_feed WITH (security_invoker = true) AS
SELECT al.id, al.level, al.kind, al.title, al.body, al.advice, al.status, al.created_at,
  al.area_id, COALESCE(al.lat, a.lat) AS lat, COALESCE(al.lng, a.lng) AS lng,
  a.slug AS area_slug, a.name AS area_name, a.township
FROM public.alerts al LEFT JOIN public.areas a ON a.id = al.area_id;
GRANT SELECT ON public.v_alert_feed TO anon, authenticated, service_role;

CREATE VIEW public.v_signal_trends WITH (security_invoker = true) AS
WITH agg AS (
  SELECT r.type,
    count(*) FILTER (WHERE r.created_at > now() - interval '7 days')::int AS current_count,
    count(*) FILTER (WHERE r.created_at <= now() - interval '7 days' AND r.created_at > now() - interval '14 days')::int AS previous_count
  FROM public.reports r GROUP BY r.type
)
SELECT type, current_count, previous_count,
  CASE WHEN previous_count = 0 THEN NULL
       ELSE round(((current_count - previous_count)::numeric / previous_count) * 100)::int END AS trend_pct
FROM agg;
GRANT SELECT ON public.v_signal_trends TO anon, authenticated, service_role;

ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP POLICY IF EXISTS "Report photos are readable" ON storage.objects;
CREATE POLICY "Report photos are readable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'report-photos');
DROP POLICY IF EXISTS "Anyone can upload a report photo" ON storage.objects;
CREATE POLICY "Anyone can upload a report photo" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'report-photos');

INSERT INTO public.areas (slug, name, township, lat, lng, radius_m, base_score, trend_pct, baseline_reports, components, baseline_at) VALUES
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
 '{"water":{"label":"Water quality reports","score":20,"detail":"No water quality reports this week"},"sanitation":{"label":"Sanitation","score":26,"detail":"One street-drain complaint"},"flooding":{"label":"Flooding","score":16,"detail":"No flooding reported"},"illness":{"label":"Illness signals","score":12,"detail":"No illness signals this week"}}'::jsonb, now() - interval '14 days');

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

WITH n AS (
  SELECT id, row_number() OVER (ORDER BY id) AS rn FROM public.reports WHERE anon_token LIKE 'seed-%'
)
UPDATE public.reports r
SET created_at = now()
  - ((CASE WHEN (n.rn % 10) < 7 THEN (n.rn % 7) ELSE 7 + (n.rn % 7) END) || ' days')::interval
  - (((n.rn * 7) % 24) || ' hours')::interval
FROM n WHERE n.id = r.id;

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
       now() - (x.hours_ago || ' hours')::interval, a.lat + x.dlat, a.lng + x.dlng
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

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       u.email, extensions.crypt('WaterWatch2026!', extensions.gen_salt('bf')),
       now(), '{"provider":"email","providers":["email"]}'::jsonb,
       jsonb_build_object('display_name', u.display_name), now(), now()
FROM (VALUES
  ('admin@waterwatch.dev',   'Aung Kyaw (Admin)'),
  ('org@waterwatch.dev',     'Thida Win (Partner Org)'),
  ('citizen@waterwatch.dev', 'Su Su (Resident)')
) AS u(email, display_name)
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = u.email);

INSERT INTO auth.identities (user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
SELECT au.id, au.id::text, 'email', jsonb_build_object('sub', au.id::text, 'email', au.email), now(), now(), now()
FROM auth.users au
WHERE au.email IN ('admin@waterwatch.dev','org@waterwatch.dev','citizen@waterwatch.dev')
  AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = au.id AND i.provider = 'email');

INSERT INTO public.profiles (user_id, display_name)
SELECT au.id, au.raw_user_meta_data->>'display_name' FROM auth.users au
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'citizen' FROM auth.users au
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin' FROM auth.users au WHERE au.email = 'admin@waterwatch.dev'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role, area_id)
SELECT au.id, 'org', a.id FROM auth.users au
JOIN public.areas a ON a.slug IN ('hlaing-tharyar','shwepyithar')
WHERE au.email = 'org@waterwatch.dev'
ON CONFLICT DO NOTHING;

UPDATE public.profiles p SET area_id = a.id, display_name = 'Su Su (Resident)', updated_at = now()
FROM auth.users au, public.areas a
WHERE p.user_id = au.id AND au.email = 'citizen@waterwatch.dev' AND a.slug = 'dala';

UPDATE public.profiles p SET display_name = 'Aung Kyaw (Admin)', updated_at = now()
FROM auth.users au WHERE p.user_id = au.id AND au.email = 'admin@waterwatch.dev';

UPDATE public.profiles p SET display_name = 'Thida Win (Partner Org)', updated_at = now()
FROM auth.users au WHERE p.user_id = au.id AND au.email = 'org@waterwatch.dev';