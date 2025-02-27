# Gestion de Location de Voiture - Backend

## Description

Cette application backend fournit une API complète pour un système de gestion de location de voitures. Elle permet de gérer les utilisateurs, les véhicules, les réservations, les locations pour une entreprise de location de voitures.

## Prérequis

Avant de démarrer, assurez-vous d'avoir installé les logiciels suivants :

- **Node.js** (version 14 ou supérieure)
- **PostgreSQL** (version 12 ou supérieure)
- **Postman** (pour tester l'API)
- **Git** (pour cloner et gérer le projet)

## Installation

1. Clonez le dépôt sur votre machine locale :

```bash
git clone https://github.com/MohamedSoumare/gestion-location-voiture-backend.git
```

2. Accédez au répertoire du projet :

```bash
cd gestion-location-voiture-backend
```

3. Installez les dépendances du projet :

```bash
npm install
```

## Configuration de la Base de Données

1. Assurez-vous que PostgreSQL est en cours d'exécution sur votre machine locale.
2. Créez un fichier `.env` à la racine du projet avec la configuration suivante :

```bash
# Configuration de la base de données
DATABASE_URL="postgresql://username:password@localhost:5432/car_rental_db"
# Configuration du serveur
PORT=5000
JWT_SECRET=votre_secret_jwt
```

3. Utilisez Prisma pour initialiser la base de données :

```bash
# Générer les migrations
npx prisma migrate dev

# Pousser le schéma vers la base de données
npx prisma db push
```

## Démarrage de l'Application

Pour démarrer l'application :

```bash
npm start
```

## Génération des Données de Test (Seed)

Pour remplir la base de données avec des données de test :

```bash
npm run seed
```

Après l'exécution du script, les utilisateurs suivants seront disponibles dans la base de données :

```json
{
  "email": "admin@admin.com",
  "password": "Admin1234"
}
```

## Analyse et formatage de code

L'analyse statique du code est réalisée avec **ESLint** et le formatage avec **Prettier**.

### Pour lancer l'analyse du code :

```bash
npm run lint
```

### Pour lancer le formatage du code :

```bash
npm run format
```

## Documentation des Endpoints API

Vous pouvez importer la collection Postman **Collection-api-rental-cars.postman_collection.json**, disponible à la racine du projet, pour tester facilement tous les endpoints sur **[Postman](https://web.postman.co/workspace/My-Workspace~60f85a58-2c45-4e2e-8712-9e9a5685f027/collection/38822647-1b6d7efe-f7a0-41d7-8456-ed2080fa4c46)**.

### Endpoints Principaux

#### Exemple pour l'utilisateurs :

- `GET /users` : Récupérer tous les utilisateurs
- `POST /users/add` : Créer un nouvel utilisateur
- `PUT /user/edit/:id` : Modifier un utilisateur
- `DELETE /user/delete/:id` : Supprimer un utilisateur

## Sécurité

- Authentification basée sur JWT
- Mots de passe hashés avec bcrypt
- Validation des entrées
- Gestion des rôles et des autorisations

## Auteur

[Mohamed Bakary Soumaré](https://github.com/MohamedSoumare/)

## Contact

- Email : mohamedsoumare17763@gmail.com
- Projet Link: [https://github.com/MohamedSoumare/gestion-location-voiture-backend](https://github.com/MohamedSoumare/gestion-location-voiture-backend)
