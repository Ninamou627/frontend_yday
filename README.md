# HumanAI - Plateforme RH & Management (Frontend)

Ce dépôt contient le code source du frontend de l'application **HumanAI** (Projet Ydays 2026), une plateforme SaaS de gestion des ressources humaines, du bien-être au travail (QVT) et d'assistance basée sur l'intelligence artificielle.

## 🚀 Fonctionnalités principales

L'application est découpée en plusieurs modules adaptés à différents rôles utilisateurs :

- **Collaborateur** : Dashboard personnel, assistant IA, intégration (onboarding), documents, et sondages.
- **Manager** : Alertes de sécurité/management, validations de demandes, assistant IA pour les managers.
- **Ressources Humaines (RH)** : Gestion de l'annuaire, cycle de vie (onboarding/offboarding), validations des documents et processus.
- **Qualité de Vie au Travail (QVT)** : Suivi du bien-être, analyses de sentiment, sondages (pulse), et recommandations.
- **Exécutif (Executive)** : Tableaux de bord de haut niveau, rapports et sandbox stratégique.
- **Administrateur Système (Sysadmin)** : Gestion des rôles et permissions (RBAC), base de connaissances RAG, paramètres de sécurité.

## 🛠️ Stack Technique

- **Framework** : [React](https://react.dev/) 19 (via [Vite](https://vitejs.dev/))
- **Routage** : React Router DOM
- **Style** : [Tailwind CSS](https://tailwindcss.com/)
- **Icônes** : Lucide React
- **Appels API** : Axios
- **Notifications** : React Hot Toast
- **Authentification** : Mixte (Native & Firebase)
- **Rendu Markdown/PDF** : react-markdown, html2pdf.js

## 📁 Structure du projet

```text
src/
├── assets/         # Images, logos, etc.
├── components/     # Composants réutilisables (ex: Sidebar, boutons)
├── context/        # Contextes globaux (ex: AuthContext)
├── services/       # Configuration API et Firebase (api.js, firebase.js, useApi.js)
└── views/          # Pages de l'application classées par rôle
    ├── auth/       # Pages d'authentification
    ├── collaborator/
    ├── executive/
    ├── hr/
    ├── manager/
    ├── qvt/
    └── sysadmin/
```

## ⚙️ Installation et lancement local

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- Un backend configuré et en cours d'exécution (sur `http://localhost:8000` par défaut).

### Étapes

1. **Cloner le dépôt** (ou accéder au dossier) :
   ```bash
   git clone https://github.com/Ninamou627/frontend_yday.git
   cd frontend_yday
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement** :
   Copiez ou créez un fichier `.env` à la racine du projet avec les variables nécessaires (par exemple l'URL de l'API backend et les clés Firebase).
   ```env
   VITE_API_URL=http://localhost:8000
   # ... autres variables Firebase
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5173`.

## 📜 Scripts disponibles

- `npm run dev` : Lance le serveur de développement avec HMR.
- `npm run build` : Compile l'application pour la production.
- `npm run lint` : Vérifie les erreurs de linting avec ESLint.
- `npm run preview` : Prévisualise la version de production en local.
