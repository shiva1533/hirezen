-- Ensure anon and authenticated roles can INSERT when RLS allows it
GRANT INSERT ON TABLE public.candidates TO anon, authenticated;
-- Keep SELECT for lists (already available but safe to ensure)
GRANT SELECT ON TABLE public.candidates TO anon, authenticated;
-- Optional: allow UPDATE only via policies later (no grant now)
