# Contributing

## Prérequis
npm uniquement. Pas de yarn, pas de pnpm.
`package-lock.json` est toujours committé.

## Branches
`main` est protégée : pas de push direct.

Une branche = une tâche ClickUp.

Format : `type/ID-description-courte`
Exemple : `feat/86c85pbfn-data-modeling`

Types : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

Durée de vie : 3 jours maximum. Au-delà, découper la tâche.

## Commits
Conventional Commits :

```
feat(api): add user CRUD endpoints
fix(web): correct search filter reset
docs: update architecture diagram
```

## Pull requests
1. Ouvrir une PR vers `main`
2. Remplir le template
3. CI verte obligatoire
4. 1 review minimum, par quelqu'un d'autre que l'auteur
5. Squash and merge, puis supprimer la branche

Le reviewer tourne : on ne relit pas toujours la même personne.

## Definition of Done
- [ ] Code mergé sur `main`
- [ ] CI verte
- [ ] Testé sur staging
- [ ] Documentation à jour
- [ ] Tâche ClickUp passée en Done

## Secrets
Jamais dans le repo, jamais sur Discord.
Bitwarden pour l'équipe, GitHub Secrets pour la CI.
Toute nouvelle variable est ajoutée à `.env.example`.

## Architecture modulaire

### Repartition des features

| Dev | Branch | Features | Dossiers API | Dossiers Web |
|-----|--------|----------|--------------|--------------|
| **R** | `feat/auth` | F1 (inscription), F3 (connexion), Socle middleware auth | `modules/auth/`, `common/guards/` | `features/auth/` |
| **E** | `feat/users` | F2 (verif email), F4 (profil), Socle seed | `modules/users/`, `seed.ts` | `features/auth/` (profil) |
| **L** | `feat/messaging` | F13 (messages), F14 (signalement), F15 (moderation) | `modules/messaging/`, `modules/reports/` | `features/messaging/` |
| **J** | `feat/applications` | F11 (candidater), F12 (accepter/refuser), Socle format API | `modules/applications/`, `common/` | `features/applications/` |

### Structure API (apps/api/src/)

```
common/              <- partage (guards, pipes, filters)
database/            <- ne pas toucher
health/              <- ne pas toucher
modules/
  listings/          <- existant, ne pas modifier sauf bug
  auth/              <- Dev R
  users/             <- Dev E
  messaging/         <- Dev L
  reports/           <- Dev L
  applications/      <- Dev J
```

### Regles de zone de code
- **Chacun ne touche que ses dossiers**
- Fichiers partages a modifier avec communication prealable :
  - `app.module.ts` (ajouter son module)
  - `packages/shared/src/types.ts` (ajouter ses types)
  - `apps/web/src/lib/api.ts` (ajouter ses fonctions API)
  - `apps/web/src/app/layout.tsx` (navigation)
  - `infra/base_db.sql` (schema de reference)

### Base de donnees locale
Chaque dev a sa propre DB :
```bash
sudo -u postgres psql -c "CREATE USER eduhousing WITH PASSWORD 'eduhousing';"
sudo -u postgres psql -c "CREATE DATABASE eduhousing OWNER eduhousing;"
psql -U eduhousing -h localhost eduhousing < infra/base_db.sql
npm run seed
```

### Migrations
- Fichiers dans `apps/api/src/migrations/`
- Nommer avec un numero sequentiel : `003_applications-and-reports.sql`
- Ne jamais modifier une migration existante, en creer une nouvelle
