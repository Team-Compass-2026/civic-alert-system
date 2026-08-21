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