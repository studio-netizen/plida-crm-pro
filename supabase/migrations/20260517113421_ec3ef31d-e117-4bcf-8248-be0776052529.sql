
ALTER FUNCTION public.set_updated_meta() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.is_operatrice() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_meta() FROM PUBLIC, anon, authenticated;

-- is_operatrice è chiamata dalle policy RLS (con auth.uid()): serve permesso agli authenticated
GRANT EXECUTE ON FUNCTION public.is_operatrice() TO authenticated;
