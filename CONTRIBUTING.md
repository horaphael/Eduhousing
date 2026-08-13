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
