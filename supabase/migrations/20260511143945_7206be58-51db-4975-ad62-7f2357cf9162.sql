
-- department_members table
CREATE TABLE public.department_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (department_id, user_id)
);

ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;

-- add department_id to user_roles for department leaders
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS department_id uuid;

-- helper: is user leader of department
CREATE OR REPLACE FUNCTION public.is_department_leader(_user_id uuid, _department_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND department_id = _department_id AND role = 'leader'
  )
$$;
GRANT EXECUTE ON FUNCTION public.is_department_leader(uuid, uuid) TO authenticated, anon;

-- helper: can manage department (super_admin, church admin/leader, or this dept leader)
CREATE OR REPLACE FUNCTION public.can_manage_department(_department_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
  OR EXISTS (
    SELECT 1 FROM public.departments d
    WHERE d.id = _department_id AND public.can_manage_church(d.church_id)
  )
  OR public.is_department_leader(auth.uid(), _department_id)
$$;
GRANT EXECUTE ON FUNCTION public.can_manage_department(uuid) TO authenticated, anon;

-- RLS policies for department_members
CREATE POLICY "view church dept members" ON public.department_members
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.departments d
    WHERE d.id = department_members.department_id
      AND (d.church_id = current_user_church() OR has_role(auth.uid(), 'super_admin'))
  )
);

CREATE POLICY "manage dept members" ON public.department_members
FOR ALL TO authenticated
USING (public.can_manage_department(department_id))
WITH CHECK (public.can_manage_department(department_id));

-- update generate_monthly_schedule to only pick department members
CREATE OR REPLACE FUNCTION public.generate_monthly_schedule(_church_id uuid, _year integer, _month integer)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s_rec record; d_rec record; u_id uuid; inserted_count int := 0;
BEGIN
  IF NOT public.can_manage_church(_church_id) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  PERFORM public.materialize_recurring_for_month(_church_id, _year, _month);
  FOR s_rec IN
    SELECT id FROM public.services
    WHERE church_id = _church_id
      AND extract(year from service_date) = _year
      AND extract(month from service_date) = _month
  LOOP
    FOR d_rec IN SELECT id FROM public.departments WHERE church_id = _church_id LOOP
      SELECT p.id INTO u_id FROM public.profiles p
      JOIN public.department_members dm ON dm.user_id = p.id AND dm.department_id = d_rec.id
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
GRANT EXECUTE ON FUNCTION public.generate_monthly_schedule(uuid, integer, integer) TO authenticated, anon;

-- allow leaders/admins/super_admin to insert role rows scoped to their church/dept
CREATE POLICY "managers assign dept leaders" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin')
  OR (church_id IS NOT NULL AND can_manage_church(church_id))
);

CREATE POLICY "managers delete dept leaders" ON public.user_roles
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'super_admin')
  OR (church_id IS NOT NULL AND can_manage_church(church_id))
);
