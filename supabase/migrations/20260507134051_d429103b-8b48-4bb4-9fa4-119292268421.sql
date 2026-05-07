GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_church(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_church() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.register_with_church_code(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_monthly_schedule(uuid, integer, integer) TO authenticated;