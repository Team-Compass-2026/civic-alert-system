-- Migration: Setup completion — demo alerts seed + storage bucket
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
-- 2. Seed demo alerts (only if table is empty — idempotent)
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
   'Multiple unsafe-water reports filed in Hlaing Tharyar over the past 48 hours. Base risk score is 82/100 — HIGH.',
   'Use treated or boiled water for drinking and cooking until the situation is confirmed clear.',
   'hlaing-tharyar',2),
  ('HIGH','risk','Flood risk rising in Hlaing Tharyar',
   'Street flooding reported in low-lying lanes after heavy rain. Risk score elevated to HIGH (82/100).',
   'Avoid wading through floodwater and keep children away from open drains.',
   'hlaing-tharyar',8),
  ('MODERATE','update','Water quality improving in Thaketa',
   'Canal water near the jetty still shows oily film but fewer reports this week. Score 61/100 — MODERATE.',
   'Keep reporting anything unusual — early reports keep the score accurate.',
   'thaketa',18),
  ('CRITICAL','warning','Possible contamination in Hlaing Tharyar',
   'Multiple unsafe-water and illness-cluster reports in the same ward within 24 hours. Immediate action required.',
   'Boil drinking water for at least one minute or use treated bottled water until further notice.',
   'hlaing-tharyar',4)
) AS x(level, kind, title, body, advice, slug, age_hours)
JOIN public.areas a ON a.slug = x.slug
WHERE NOT EXISTS (SELECT 1 FROM public.alerts LIMIT 1);
