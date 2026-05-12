CREATE TABLE public.service_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  title text NOT NULL,
  artist text,
  song_key text,
  link text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_songs_service ON public.service_songs(service_id);

ALTER TABLE public.service_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view church songs" ON public.service_songs
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.services s
  WHERE s.id = service_songs.service_id
    AND (s.church_id = current_user_church() OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "manage church songs" ON public.service_songs
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.services s
  WHERE s.id = service_songs.service_id AND can_manage_church(s.church_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.services s
  WHERE s.id = service_songs.service_id AND can_manage_church(s.church_id)
));