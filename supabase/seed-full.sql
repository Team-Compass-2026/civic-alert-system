-- WaterWatch full seed — idempotent (safe to re-run).
-- Sections: 1 reports · 2 alerts · 3 demo accounts for every role.
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
-- SECTION 3: Demo accounts — one per role (idempotent).
--   admin@waterwatch.dev   / WaterWatch2026!  → sees EVERYTHING
--   org@waterwatch.dev     / WaterWatch2026!  → org dashboard, pinned to
--                                             Hlaing Tharyar + Shwepyithar
--   citizen@waterwatch.dev / WaterWatch2026!  → citizen app, home = Dala
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
