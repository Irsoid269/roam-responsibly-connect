-- Phase 3 (gouvernance) — RBAC étendue (cahier) : Organizer, PartnerManager,
-- Support, Finance en plus de admin/moderator/user.
--
-- IMPORTANT : cette migration doit être exécutée et validée SEULE, dans sa
-- propre exécution ("Run"), avant la migration suivante
-- (20260921110000_rbac_extended_roles_policies.sql). PostgreSQL interdit
-- d'utiliser une nouvelle valeur d'enum dans la même transaction que celle où
-- elle a été ajoutée ("unsafe use of new value of enum type") — si les deux
-- fichiers sont collés et exécutés en une seule fois, la policy qui référence
-- 'organizer'/'partner_manager'/'support'/'finance' échouera.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'organizer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';
