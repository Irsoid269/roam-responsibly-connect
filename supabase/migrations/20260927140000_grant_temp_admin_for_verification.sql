-- Rôle admin temporaire sur le compte de test créé pour vérifier le
-- back-office (coworkings/hébergements/destinations). À retirer une fois la
-- vérification terminée et le compte supprimé.
INSERT INTO public.user_roles (user_id, role)
VALUES ('3e8e61f2-1e16-48c3-a4d8-44939a2aa2b2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
