
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(church_id, name)
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name text NOT NULL,
  service_date date NOT NULL,
  service_time time,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_services_church_date ON public.services(church_id, service_date);

CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(service_id, user_id)
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_assignments_user ON public.assignments(user_id);
CREATE INDEX idx_assignments_service ON public.assignments(service_id);

CREATE OR REPLACE FUNCTION public.current_user_church()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT church_id FROM public.profiles WHERE id = auth.uid()
$$;
REVOKE EXECUTE ON FUNCTION public.current_user_church() FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.can_manage_church(_church_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND church_id = _church_id
        AND role IN ('admin'::app_role,'leader'::app_role)
    )
$$;
REVOKE EXECUTE ON FUNCTION public.can_manage_church(uuid) FROM PUBLIC, anon;

CREATE POLICY "view church departments" ON public.departments FOR SELECT TO authenticated
  USING (church_id = public.current_user_church() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "manage church departments" ON public.departments FOR ALL TO authenticated
  USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));

CREATE POLICY "view church services" ON public.services FOR SELECT TO authenticated
  USING (church_id = public.current_user_church() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "manage church services" ON public.services FOR ALL TO authenticated
  USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));

CREATE POLICY "view church assignments" ON public.assignments FOR SELECT TO authenticated
  USING (
    EXISTS(SELECT 1 FROM public.services s WHERE s.id = service_id
      AND (s.church_id = public.current_user_church() OR public.has_role(auth.uid(),'super_admin')))
  );
CREATE POLICY "manage church assignments" ON public.assignments FOR ALL TO authenticated
  USING (
    EXISTS(SELECT 1 FROM public.services s WHERE s.id = service_id AND public.can_manage_church(s.church_id))
  ) WITH CHECK (
    EXISTS(SELECT 1 FROM public.services s WHERE s.id = service_id AND public.can_manage_church(s.church_id))
  );

CREATE POLICY "leaders view church profiles" ON public.profiles FOR SELECT TO authenticated
  USING (church_id = public.current_user_church() AND public.can_manage_church(church_id));

CREATE POLICY "leaders view church roles" ON public.user_roles FOR SELECT TO authenticated
  USING (church_id = public.current_user_church() AND public.can_manage_church(church_id));

CREATE OR REPLACE FUNCTION public.generate_monthly_schedule(
  _church_id uuid, _year int, _month int
) RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s_rec record; d_rec record; u_id uuid; inserted_count int := 0;
BEGIN
  IF NOT public.can_manage_church(_church_id) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;
  FOR s_rec IN
    SELECT id FROM public.services
    WHERE church_id = _church_id
      AND extract(year from service_date) = _year
      AND extract(month from service_date) = _month
  LOOP
    FOR d_rec IN SELECT id FROM public.departments WHERE church_id = _church_id LOOP
      SELECT p.id INTO u_id FROM public.profiles p
      WHERE p.church_id = _church_id
        AND NOT EXISTS (
          SELECT 1 FROM public.assignments a
          WHERE a.service_id = s_rec.id AND a.user_id = p.id
        )
      ORDER BY (
        SELECT count(*) FROM public.assignments a2
        JOIN public.services s2 ON s2.id = a2.service_id
        WHERE a2.user_id = p.id
          AND extract(year from s2.service_date) = _year
          AND extract(month from s2.service_date) = _month
      ) ASC, random()
      LIMIT 1;
      IF u_id IS NOT NULL THEN
        INSERT INTO public.assignments(service_id, department_id, user_id)
        VALUES (s_rec.id, d_rec.id, u_id) ON CONFLICT DO NOTHING;
        inserted_count := inserted_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  RETURN inserted_count;
END; $$;
REVOKE EXECUTE ON FUNCTION public.generate_monthly_schedule(uuid,int,int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_monthly_schedule(uuid,int,int) TO authenticated;
