
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.register_with_church_code(text, text) from public, anon;
grant execute on function public.register_with_church_code(text, text) to authenticated;
