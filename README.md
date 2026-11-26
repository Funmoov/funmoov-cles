# Relais Funmoov — clés VanMoof (Vercel, gratuit)

Ce petit relais permet à l'app Funmoov de récupérer les clés de tes vélos
**directement**, sans passer par le script Python. Le mot de passe VanMoof
transite une seule fois par le relais pour interroger les serveurs officiels
VanMoof ; il n'est **ni stocké ni journalisé**.

## Déploiement (gratuit, ~5 min)

### Option A — via GitHub (recommandé)
1. Crée un nouveau dépôt GitHub (ex. `funmoov-cles`) et mets-y le dossier `api/`
   (avec le fichier `api/cles-vanmoof.js`).
2. Sur https://vercel.com → **Add New… → Project** → importe ce dépôt → **Deploy**.
3. Une fois déployé, ton URL est :
   `https://NOM-DU-PROJET.vercel.app/api/cles-vanmoof`

### Option B — via la ligne de commande
```bash
npm i -g vercel
cd vercel-relais
vercel           # suit les questions, puis :
vercel --prod    # met en production
```
L'URL finale sera `https://NOM-DU-PROJET.vercel.app/api/cles-vanmoof`.

## Brancher l'app
Dans l'app Funmoov → onglet **Garage** → carte **« Récupérer mes clés automatiquement »**
→ ouvre **⚙️ Configurer le relais (une fois)** → colle l'URL ci-dessus → **Enregistrer**.
C'est fait : tu peux maintenant saisir ton compte VanMoof et récupérer tes clés d'un clic.

## Notes
- Aucune dépendance : Vercel utilise Node 18+ (fetch intégré). Rien à installer côté projet.
- Pas de nom de domaine nécessaire ; l'adresse `*.vercel.app` suffit.
- Offre Vercel **Hobby** (gratuite) : très largement suffisante (2 requêtes par récupération).
- Sécurité : si tu veux restreindre l'accès, remplace `"*"` par l'origine de ton app
  (ex. `"https://funmoov.github.io"`) dans `Access-Control-Allow-Origin`.
