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