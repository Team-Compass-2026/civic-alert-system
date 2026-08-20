
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
('LOW','update','Insein conditions stable','No significant WASH hazards reported in the last week.','Keep reporting anything unusual — early reports keep the score accurate.','5aac9148-1c7d-4cb9-aa98-6d0ccc7a2dd6','active', now() - interval '3 days');
