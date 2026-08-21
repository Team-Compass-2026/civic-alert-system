-- SECTION 4: Reports (run after areas)
-- Each statement is separate to avoid SQL Editor parsing issues.

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Tap water is brown and cloudy since morning', 'This morning', 16.8735, 96.0705, a.id, true, now() - interval '3 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sewage'::public.report_type, 'Sewage overflowing onto road near the market', 'Yesterday', 16.8698, 96.0651, a.id, true, now() - interval '20 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'illness_cluster'::public.report_type, 'Several households have diarrhea after flooding', 'Past three days', 16.8752, 96.0662, a.id, true, now() - interval '30 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'flooding'::public.report_type, 'Street flooded knee-deep after rain last night', 'Last night', 16.8681, 96.0721, a.id, true, now() - interval '14 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Canal water looks oily near the jetty', 'Two days ago', 16.7975, 96.2301, a.id, true, now() - interval '44 hours'
FROM public.areas a WHERE a.slug = 'thaketa';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sanitation'::public.report_type, 'Public toilet near bus stop is overflowing', 'Yesterday', 16.7938, 96.2255, a.id, true, now() - interval '26 hours'
FROM public.areas a WHERE a.slug = 'thaketa';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Community well water is dirty with particles', 'This week', 16.8392, 96.2489, a.id, true, now() - interval '52 hours'
FROM public.areas a WHERE a.slug = 'south-dagon';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'flooding'::public.report_type, 'Low lane behind school floods every rain', 'Yesterday', 16.8361, 96.2441, a.id, true, now() - interval '34 hours'
FROM public.areas a WHERE a.slug = 'south-dagon';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'broken_infrastructure'::public.report_type, 'Water pipe broken at corner leaking all day', 'Two hours ago', 16.9071, 96.2148, a.id, true, now() - interval '2 hours'
FROM public.areas a WHERE a.slug = 'north-dagon';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sanitation'::public.report_type, 'Open sewage next to primary school gate', 'Three days ago', 16.8961, 96.1024, a.id, true, now() - interval '70 hours'
FROM public.areas a WHERE a.slug = 'insein';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Cloudy tube-well water near the school', 'Yesterday', 16.9465, 96.0515, a.id, true, now() - interval '8 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sewage'::public.report_type, 'Blocked drains spilling into lanes', 'Today', 16.9435, 96.0485, a.id, true, now() - interval '5 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'illness_cluster'::public.report_type, 'Several children sick with diarrhea in ward 9', 'This week', 16.9440, 96.0520, a.id, true, now() - interval '18 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Vendor water had visible sediment', 'Two days ago', 16.8615, 96.2515, a.id, true, now() - interval '11 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sewage'::public.report_type, 'Toilet block near bus stop overflowing', 'Yesterday', 16.8585, 96.2485, a.id, true, now() - interval '22 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'flooding'::public.report_type, 'Two lanes flooded after drainage blocked', 'Last night', 16.8620, 96.2520, a.id, true, now() - interval '8 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Intermittent supply forcing vendor water purchases', 'This week', 16.9165, 96.1715, a.id, true, now() - interval '12 hours'
FROM public.areas a WHERE a.slug = 'north-okkalapa';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sanitation'::public.report_type, 'Waste piling near market drain', 'Yesterday', 16.9135, 96.1685, a.id, true, now() - interval '6 hours'
FROM public.areas a WHERE a.slug = 'north-okkalapa';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'sewage'::public.report_type, 'Tube wells with strange odour near school', 'Three days ago', 16.9515, 96.1415, a.id, true, now() - interval '14 hours'
FROM public.areas a WHERE a.slug = 'mingaladon';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'unsafe_water'::public.report_type, 'Households depending on dirty vendor water', 'This week', 16.7515, 96.1515, a.id, true, now() - interval '20 hours'
FROM public.areas a WHERE a.slug = 'dala';

INSERT INTO public.reports (type, description, when_happened, lat, lng, area_id, is_anonymous, created_at)
SELECT 'flooding'::public.report_type, 'Tidal flooding in riverside lanes', 'Yesterday', 16.7485, 96.1485, a.id, true, now() - interval '10 hours'
FROM public.areas a WHERE a.slug = 'dala';

-- SECTION 5: Alerts (run after reports)
INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'CRITICAL'::public.risk_level, 'warning', 'Possible contamination in Hlaing Tharyar', 'Multiple unsafe-water and illness reports in the same ward.', 'Boil drinking water or use bottled water.', a.id, 'active', now() - interval '2 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Water quality concerns near market', 'Nine water reports in 7 days, six confirmed by neighbors.', 'Use boiled or treated water for drinking.', a.id, 'active', now() - interval '3 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Diarrhea signals rising in Hlaing Tharyar', 'Several households reported diarrhea after flooding.', 'Use ORS and seek clinic care for dehydration.', a.id, 'active', now() - interval '18 hours'
FROM public.areas a WHERE a.slug = 'hlaing-tharyar';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Sewage overflow in Shwepyithar ward 9', 'Blocked drains spilling waste into lanes.', 'Avoid contact with standing water.', a.id, 'active', now() - interval '7 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'verification', 'Can you verify cloudy tube-well water?', 'A resident reported cloudy water near the school.', 'Open the alert to confirm.', a.id, 'active', now() - interval '26 hours'
FROM public.areas a WHERE a.slug = 'shwepyithar';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Toilet block overflow in Dagon Seikkan', 'Public toilet block is overflowing.', 'Avoid the area with young children.', a.id, 'active', now() - interval '11 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Flooding standing in Dagon Seikkan lanes', 'Two lanes remain flooded after rainfall.', 'Do not let children play in flood water.', a.id, 'active', now() - interval '40 hours'
FROM public.areas a WHERE a.slug = 'dagon-seikkan';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Canal water discolouration near Thaketa jetty', 'Oily discoloured water along the canal.', 'Do not use canal water for washing food.', a.id, 'active', now() - interval '15 hours'
FROM public.areas a WHERE a.slug = 'thaketa';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Community well dirty in South Dagon', 'A shared well reported dirty by two residents.', 'Boil water before drinking.', a.id, 'active', now() - interval '22 hours'
FROM public.areas a WHERE a.slug = 'south-dagon';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Vendor water sediment in Dala', 'Riverside households report sediment in water.', 'Let water settle and boil before drinking.', a.id, 'active', now() - interval '30 hours'
FROM public.areas a WHERE a.slug = 'dala';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'LOW'::public.risk_level, 'update', 'Drain clearing completed in North Okkalapa', 'The drain blockage near the market has been cleared.', NULL, a.id, 'resolved', now() - interval '48 hours'
FROM public.areas a WHERE a.slug = 'north-okkalapa';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'MODERATE'::public.risk_level, 'advisory', 'Open sewage near an Insein school', 'Open sewage reported beside a school fence.', 'Keep children away from the area.', a.id, 'monitoring', now() - interval '52 hours'
FROM public.areas a WHERE a.slug = 'insein';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'LOW'::public.risk_level, 'update', 'Water pipe repaired in North Dagon', 'Broken main pipe has been repaired.', NULL, a.id, 'resolved', now() - interval '60 hours'
FROM public.areas a WHERE a.slug = 'north-dagon';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'LOW'::public.risk_level, 'update', 'No unusual signals in Kamayut', 'No unusual water or sanitation signals this week.', NULL, a.id, 'monitoring', now() - interval '20 hours'
FROM public.areas a WHERE a.slug = 'kamayut';

INSERT INTO public.alerts (level, kind, title, body, advice, area_id, status, created_at)
SELECT 'HIGH'::public.risk_level, 'advisory', 'Elevated risk in Bahan ward', 'Multiple water-quality reports near pagoda road.', 'Use treated or boiled water until confirmed safe.', a.id, 'active', now() - interval '8 hours'
FROM public.areas a WHERE a.slug = 'bahan';

-- Verify: Run this last
SELECT (SELECT count(*) FROM areas) AS areas, (SELECT count(*) FROM reports) AS reports, (SELECT count(*) FROM alerts) AS alerts;