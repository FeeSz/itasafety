CREATE TABLE IF NOT EXISTS public.partners (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    logo_url text NOT NULL,
    href text,
    tagline text,
    sort_order integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT partners_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.partners FOR SELECT
    USING (true);

CREATE POLICY "Admin users can insert partners."
    ON public.partners FOR INSERT
    WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));

CREATE POLICY "Admin users can update partners."
    ON public.partners FOR UPDATE
    USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))))
    WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));

CREATE POLICY "Admin users can delete partners."
    ON public.partners FOR DELETE
    USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION public.moddatetime('updated_at');

-- Grant permissions
GRANT ALL ON TABLE public.partners TO anon;
GRANT ALL ON TABLE public.partners TO authenticated;
GRANT ALL ON TABLE public.partners TO service_role;

-- Seed Data
INSERT INTO public.partners (name, logo_url, href, tagline, sort_order, active) VALUES
('Canada EPI', '/partners/canada.png', 'https://www.canadaepi.com.br', 'Calçados profissionais', 10, true),
('Mavaro', '/partners/mavaro.png', 'https://www.mavaro.com.br', 'Calçados de segurança', 20, true),
('Conforto', '/partners/conforto.png', 'https://www.confortoepi.com.br', 'Artefatos de couro', 30, true),
('Volk do Brasil', '/partners/volk.png', 'https://www.volkdobrasil.com.br', 'Proteção industrial', 40, true);
