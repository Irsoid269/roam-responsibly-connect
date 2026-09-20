# Catalogue Amani Resorts — pack d’intégration

Ce dossier contient une version structurée du catalogue destinée à une application mobile ou web.

## Fichiers

- `catalogue-amani-resorts.json` : données prêtes à importer.
- `catalogue-amani-resorts.schema.json` : schéma de validation JSON.
- `types.ts` : interfaces TypeScript.
- `integration-example.ts` : exemple de chargement, filtrage et contrôle des données.
- `assets/README.md` : convention de nommage et dimensions recommandées pour les images.

## Principes d’intégration

1. Importer le fichier JSON dans la base de données ou l’embarquer dans l’application.
2. Utiliser `id` comme identifiant stable et `slug` pour les URL ou routes.
3. Relier `universe_id` à l’un des quatre univers de `universes`.
4. Relier `provider_id` à `vlc` ou `discovermores`.
5. Remplacer les valeurs `null` de `booking` par les données validées avant mise en production.
6. Ajouter les images définitives dans `assets/activities/` en respectant les chemins prévus dans le JSON.

## Données à compléter avant publication

- tarifs et devise appliquée
- durée précise
- capacité minimale et maximale
- point de rendez-vous
- horaires et jours de disponibilité
- conditions d’âge et niveau physique
- inclusions et exclusions
- politique d’annulation
- images dont les droits d’utilisation commerciale sont confirmés

Le catalogue source ne fournit pas ces informations. Les champs correspondants restent donc volontairement à `null` ou vides.

