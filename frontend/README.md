# BizPilot AI — Frontend

Assistant de gestion des demandes clients pour agence immobilière (React + TypeScript + Vite).

## Démarrage

```bash
cp .env.example .env.local   # VITE_USE_MOCK=true pour les données fictives
npm install
npm run dev
```

- `VITE_USE_MOCK=true` : 4 demandes fictives, aucun appel réseau.
- Sinon, le front appelle uniquement `/api/requests`, `/api/approve`, `/api/reject`.
  En local, utilisez `vercel dev` pour exécuter les fonctions de `api/`.

## Sécurité

Le navigateur n'appelle jamais n8n ni Claude. Les fonctions serverless (`api/`) relaient vers n8n
en ajoutant l'en-tête `x-api-key`. `N8N_BASE_URL` et `N8N_API_KEY` se configurent dans les
variables d'environnement Vercel (jamais avec le préfixe `VITE_`).

## Scripts

- `npm run build` : vérification TypeScript (app + fonctions api) puis build de production
- `npm run lint` : oxlint
