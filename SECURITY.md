# Amani Resorts — notes sécurité

## Secrets
- Ne jamais committer `.env` (déjà dans `.gitignore`).
- Variables attendues côté client Vite uniquement :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY` (clé **anon** publique, jamais la `service_role`)
- La clé `service_role` ne doit vivre que dans un backend / Edge Functions Supabase.

## RLS
- Appliquer la migration `20260711190000_admin_catalog_rls_and_review_moderation.sql`.
- INSERT catalogue (destinations, coworkings, etc.) réservé aux admins.
- Avis publics = statut `approved` uniquement.

## Rate limiting
- Auth : configurer les limites Supabase Auth (dashboard → Auth → Rate Limits).
- API : privilégier Edge Functions + quotas pour les écritures sensibles (réservations, uploads).

## Dépendances
- Lancer périodiquement `npm audit` / `npm audit fix` (éviter `--force` en prod sans revue).
- Vulnérabilités restantes connues liées à `vite`/`esbuild` (dev server uniquement) — correction via upgrade majeur Vite (`npm audit fix --force`), à planifier séparément.
