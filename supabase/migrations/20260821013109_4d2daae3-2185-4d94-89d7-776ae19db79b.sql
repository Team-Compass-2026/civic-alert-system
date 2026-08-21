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