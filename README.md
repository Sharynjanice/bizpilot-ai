# BizPilot AI

Assistant IA qui aide une petite entreprise à traiter ses demandes clients reçues par e-mail. L'IA résume, classe et prépare une réponse ; c'est l'humain qui valide avant tout envoi.

Projet portfolio de Sharyn Djiodop Foka. Les données de démonstration sont fictives.

## Le problème

Dans une TPE, chaque demande doit être lue, comprise, puis recevoir une réponse. C'est répétitif et on risque des retards ou des oublis.

## La solution

1. Un e-mail arrive dans Gmail.
2. n8n le récupère et l'envoie à l'API Claude.
3. Claude renvoie un résumé, une catégorie, les informations extraites, ce qui manque et un brouillon de réponse.
4. Le tableau de bord affiche la demande.
5. L'utilisateur modifie le brouillon puis clique sur « Approuver et envoyer », ou rejette.
6. Gmail envoie la réponse validée et l'historique est mis à jour.

Principe central : l'IA propose, elle ne décide pas. Aucun e-mail ne part sans un clic explicite.

## Ce qui fonctionne dans cette version

- [x] Réception d'un e-mail et analyse par Claude
- [x] Tableau de bord avec statuts, filtres et historique
- [x] Brouillon modifiable, approbation ou rejet
- [x] [Envoi réel via Gmail : à confirmer chez toi]
- [x] Protection contre le double envoi

## Limites connues

- Pas encore de Google Calendar ni de WhatsApp (évolutions prévues)
- Stockage léger dans n8n, adapté à une démonstration
- Un seul canal d'entrée : l'e-mail
- Aucun gain de temps chiffré : il faudrait le mesurer sur des essais réels

## Architecture

Gmail -> n8n -> API Claude -> stockage -> interface React -> validation humaine -> n8n -> Gmail

- frontend/ : React + TypeScript (Vite) et fonctions serverless Vercel (api/) qui relaient vers n8n
- workflows/ : workflow n8n sans aucun secret
- docs/ : scénarios de test

L'interface n'appelle jamais n8n ni Claude directement : les clés restent côté serveur.

## Stack

React, TypeScript, Vite, Vercel, n8n, API Claude, Gmail.

## Installation

1. Cloner le dépôt.
2. Dans frontend/ : npm install
3. Mode démo avec données fictives : copier .env.example en .env et mettre VITE_USE_MOCK=true, puis npm run dev
4. Pour une utilisation réelle, définir N8N_BASE_URL et N8N_API_KEY sur Vercel (aucune valeur n'est dans le dépôt).

## Importer le workflow n8n

1. Dans n8n : Create workflow, menu ..., Import from file, choisir workflows/bizpilot-workflow.json.
2. Remplacer CHANGE_ME_SECRET par votre secret dans les nœuds « Auth et liste », « Controle approbation » et « Auth et rejet ».
3. Connecter votre compte Gmail et créer un identifiant Header Auth (x-api-key) avec votre clé Anthropic.
4. Activer le workflow.

## Sécurité

- Aucune clé ni aucun token dans le navigateur ou le dépôt
- Validation humaine obligatoire avant chaque envoi
- Verrou anti double clic côté serveur
- Le contenu d'un e-mail est traité comme une donnée, jamais comme une consigne
- Seuls les e-mails dont l'objet contient « BIZPILOT » sont traités

## Tests

Voir docs/demo-scenarios.md.

## Évolutions possibles

Google Calendar, WhatsApp, catégories adaptables selon le métier, base de données, plusieurs utilisateurs.