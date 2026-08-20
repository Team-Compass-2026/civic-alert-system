GRANT INSERT ON public.profiles TO supabase_auth_admin;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

ALTER FUNCTION public.handle_new_user() SECURITY INVOKER;