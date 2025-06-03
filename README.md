# GESTCONT

GESTCONT est une application web de gestion de conteneurs pour les entreprises de logistique et de transport maritime. Elle permet de suivre l’entrée et la sortie des conteneurs, de gérer les clients, les utilisateurs, les armateurs, et d’obtenir des statistiques en temps réel via un tableau de bord moderne.

## Fonctionnalités principales

- **Authentification sécurisée** (connexion, gestion des rôles)
- **Tableau de bord** avec statistiques et graphiques
- **Gestion des conteneurs** (entrée, sortie, liste)
- **Gestion des clients** et de leurs mouvements de conteneurs
- **Administration** (utilisateurs, armateurs, codes ISO)
- **Notifications** (Toast)
- **Interface responsive** avec React, Tailwind CSS et Lucide Icons

## Structure du projet

```
frontend/
│
├── public/                # Fichiers statiques accessibles directement (index.html, favicon, etc.)
├── src/                   # Code source principal de l'application React
│   ├── components/        # Composants réutilisables de l’interface
│   │   ├── auth/          # Composants liés à l’authentification (login, formulaire, etc.)
│   │   ├── dashboard/     # Composants du tableau de bord (statistiques, graphiques)
│   │   └── layout/        # Composants de structure (Sidebar, Header, Footer…)
│   ├── contexts/          # Contextes React pour le partage d’état global (auth, utilisateur, etc.)
│   ├── pages/             # Pages principales de l’application (Accueil, Conteneurs, Clients…)
│   ├── services/          # Fonctions pour interagir avec les API ou gérer la logique métier
│   ├── App.tsx            # Point d’entrée principal de l’application, gère les routes
│   ├── main.tsx           # Fichier qui monte l’application React dans le DOM
│   └── index.css          # Fichier CSS global (inclut Tailwind et styles personnalisés)
├── tailwind.config.js     # Configuration de Tailwind CSS
├── postcss.config.js      # Configuration de PostCSS
└── package.json           # Dépendances, scripts npm et métadonnées du projet
```

## Installation

1. **Cloner le dépôt**

   ```bash
   git clone <url-du-repo>
   cd project/frontend
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer Tailwind CSS**  
   (Déjà fait si le projet est cloné, sinon :)

   ```bash
   npx tailwindcss init -p
   ```

4. **Lancer le frontend**

   ```bash
   npm run dev
   ```

5. **Lancer le backend**  
   (Depuis le dossier backend, si disponible)
   ```bash
   npm run dev
   ```

## Technologies utilisées

- **React** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **React Router**
- **Lucide React** (icônes)
- **React Toastify** (notifications)
- **Node.js/Express** (backend, non inclus ici)

## Scripts utiles

- `npm run dev` : démarre le serveur de développement
- `npm run build` : build de production
- `npm run preview` : prévisualisation du build

## Personnalisation

- **Configuration Tailwind** : `tailwind.config.js`
- **Configuration PostCSS** : `postcss.config.js`
- **Variables d’environnement** : `.env` (si besoin)

## Remarques

- Si le backend n’est pas lancé, l’application utilisera des données mock.
- Pour toute modification des routes ou de la navigation, voir `src/components/layout/Sidebar.tsx` et `src/App.tsx`.

## Auteurs

- Projet réalisé par Kouloman Youssouf COULIBALY
  Utilisez les accès suivants pour vous connecter
  User: admin
  Mdp: admin123

---

**Bon développement avec GESTCONT !**
