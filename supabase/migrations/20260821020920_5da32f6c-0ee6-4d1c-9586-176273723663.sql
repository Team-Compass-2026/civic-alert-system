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