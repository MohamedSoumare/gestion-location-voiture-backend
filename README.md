# Gestion de Location de voiture - Backend

## Description

## Prérequis

Avant de démarrer, assurez_vous d'avoir installé les logiciels suivants :

- Node.js (version 14+)
- Postgres
- npm (le gestionnaire de paquets Node.js)

## Technologies Utilisées

- **Node.js** : Plateforme Javascript coté serveur.
- **Express** : Fremework web pour Node.js.
- **Postgres** : Systéme de gestion de base de données.
- **Postman** : Utilisé pour tester l'API.

## Installation

1. Clonez le dépot sur machine local :

```
git clone https://github.com/MohamedSoumare/gestion-location-voiture-backend.git

```

2. Accedez au répertoire du projet :

```
cd gestion-location-voiture-backend
```

3. Installez les dépendances du projet :

```
npm install
```

## Utilisation

Pour démarrer l'application, exécutez la commande suiuvante :

```
npm start
```

L'API sera accessible à l'adresse http://localhost:5000.

## Configuration de la base de donnée

Assurez-vous que vous avez postgreSQL et créez une base de donnée (car_rental_db) et
dans le projet le fichier .env.example faut le renommé en .env et ajouter vos identifiant pour pouvoir se conncter à la base de donnée

## Génération des données des test Seed

Générez des données de test dans la base de données pour les entités.

```
npm run seed
```

## Endpoints de l'API

voici un exemple de collection de postman. vous pouvez importé la collection sur le racine de projet pour tester les differents endpoints de l'API.

## GET / users

- Description : Récupére toutes les utilisateur
- Réponse

```
[
    {
        "id": 4,
        "fullName": "Soumare FAll",
        "email": "soumare23@gmail.com",
        "phoneNumber": "49491916",
        "password": "$2b$12$CTd7vdw3iMdNuRcKw1WqeeSDgTQDk/p47YK2aCVkjoF11yDYLQPqC",
        "status": true,
        "role": "employe"
    },
    {
        "id": 8,
        "fullName": "Momo",
        "email": "momo@gmail.com",
        "phoneNumber": "33334444",
        "password": "$2b$12$FTE8ZBOEEFHduLM8VCrfMeGzo3o54QZcYGhdYTqNjYqowJhmFQxrW",
        "status": true,
        "role": "admin"
    },

]
```

## POST /users/add

- Description : Crée une nouvelle utilisateur.
- Corps de la requête :

```
{
  "fullName": "Momodou Fall",
  "email": "fall32@gmail.com",
  "phoneNumber": "49491919",
  "password": "Exemple2023",
  "status": true,
  "role": "employe"
}
```

## PUT /user/edit/:id

- Description : Met à jour une recette existante.
- Corps de la requête :

```
{
    "fullName": "John Smith",
    "email": "john@example.com",
    "phoneNumber": "33654321",
    "status": false,
    "role": "employe"
}

```

## DELETE /user/delete/:id

- **Description** : Supprime une utilisateur par ID.

- **Réponse** :

```json
{
  "message": "utilisateur supprimer avec succès"
}
```

### Auteur

### [Mohamed Bakary Soumaré](https://github.com/MohamedSoumare/)
