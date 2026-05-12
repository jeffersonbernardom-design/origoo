
-- 1) Unavailability
CREATE TABLE public.unavailability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day)
);
ALTER TABLE public.unavailability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manage own unavailability" ON public.unavailability
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "leaders view church unavailability" ON public.unavailability
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = unavailability.user_id
      AND p.church_id = current_user_church()
      AND can_manage_church(p.church_id)
  ));

-- 2) Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "leaders create church notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = notifications.user_id
      AND can_manage_church(p.church_id)
  ));

-- 3) Trigger: notify on assignment insert
CREATE OR REPLACE FUNCTION public.notify_on_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s_name text; s_date date; d_name text;
BEGIN
  SELECT s.name, s.service_date INTO s_name, s_date FROM public.services s WHERE s.id = NEW.service_id;
  SELECT d.name INTO d_name FROM public.departments d WHERE d.id = NEW.department_id;
  INSERT INTO public.notifications(user_id, title, body, link)
  VALUES (NEW.user_id,
    'Você foi escalado',
    coalesce(d_name,'') || ' - ' || coalesce(s_name,'') || ' em ' || to_char(s_date, 'DD/MM/YYYY'),
    '/minha-escala');
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_assignment
AFTER INSERT ON public.assignments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_assignment();

-- 4) Update generate_monthly_schedule to skip unavailable
CREATE OR REPLACE FUNCTION public.generate_monthly_schedule(_church_id uuid, _year integer, _month integer)
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  s_rec record; d_rec record; u_id uuid; inserted_count int := 0;
BEGIN
  IF NOT public.can_manage_church(_church_id) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  PERFORM public.materialize_recurring_for_month(_church_id, _year, _month);
  FOR s_rec IN
    SELECT id, service_date FROM public.services
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
        AND NOT EXISTS (
          SELECT 1 FROM public.unavailability un
          WHERE un.user_id = p.id AND un.day = s_rec.service_date
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
END; $function$;

-- 5) Allow user to update their own assignment status (confirm/decline)
CREATE POLICY "update own assignment status" ON public.assignments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
