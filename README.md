# Association des Étudiants CCNB - Application Web

Application web interactive pour l'association étudiante du Collège communautaire du Nouveau-Brunswick (CCNB) - Bathurst.

## 🚀 Fonctionnalités

### Pour les étudiants (sans authentification)
- ✅ Consulter les activités confirmées et proposées
- ✅ Voter pour les activités proposées
- ✅ Liker les activités publiées
- ✅ Proposer de nouvelles activités avec photos
- ✅ Laisser des avis sur les activités
- ✅ Commenter et liker les photos d'activités
- ✅ Contacter l'association
- ✅ Rechercher des activités par titre ou date
- ✅ Consulter les activités passées et leurs photos

### Pour les administrateurs
- ✅ Gérer les activités (créer, publier, désactiver)
- ✅ Modérer les propositions d'activités
- ✅ Modérer les avis et commentaires
- ✅ Gérer les contacts
- ✅ Gérer les comptes administrateurs
- ✅ Upload de fichiers via FTP avec optimisation automatique
- ✅ Statistiques et visualisations

## 📋 Prérequis

- **Java 17+**
- **Node.js 18+** et **npm**
- **PostgreSQL 12+**
- **Maven 3.6+**

## ⚙️ Installation

### 1. Configuration de la base de données

```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE association_etudiant_ccnb;
\q
```

### 2. Configuration du backend

1. Copiez le fichier de configuration :
   ```bash
   cd backend
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   ```

2. Modifiez `application.properties` avec vos paramètres :
   - Configuration PostgreSQL
   - Configuration FTP (optionnel)
   - Configuration Email (optionnel)

📖 **Voir [CONFIGURATION.md](backend/CONFIGURATION.md) pour les détails**

### 3. Configuration du frontend

```bash
cd frontend
npm install
```

## 🏃 Lancer l'application

### Backend

```bash
cd backend
mvn spring-boot:run
```

Le backend sera accessible sur : `http://localhost:8080`
- API : `http://localhost:8080/api`
- Swagger UI : `http://localhost:8080/swagger-ui.html`

### Frontend

```bash
cd frontend
npm start
```

Le frontend sera accessible sur : `http://localhost:4200`

## 🔐 Accès Admin

Par défaut, un compte admin est créé automatiquement :
- **Username** : `admin`
- **Password** : `admin123`

⚠️ **Changez le mot de passe après la première connexion !**

## 📁 Structure du projet

```
associationEtudiantCCNB/
├── backend/              # Application Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/ccnb/association/
│   │   │   │       ├── controller/    # Controllers REST
│   │   │   │       ├── service/       # Services métier
│   │   │   │       ├── repository/    # Repositories JPA
│   │   │   │       ├── entity/        # Entités JPA
│   │   │   │       ├── dto/           # Data Transfer Objects
│   │   │   │       └── exceptions/    # Gestion des exceptions
│   │   │   └── resources/
│   │   │       ├── application.properties.example
│   │   │       └── application.properties (à créer)
│   └── pom.xml
├── frontend/            # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Composants Angular
│   │   │   ├── services/      # Services Angular
│   │   │   └── pipes/         # Pipes personnalisés
│   └── package.json
└── README.md
```

## 🔒 Sécurité

- ⚠️ **NE COMMITEZ JAMAIS** le fichier `application.properties` sur Git
- Le fichier est déjà dans `.gitignore`
- Utilisez `application.properties.example` comme modèle
- Changez tous les mots de passe par défaut en production

## 📤 Upload de fichiers

L'application supporte l'upload de fichiers via FTP :
- Les images sont automatiquement optimisées (redimensionnement, compression)
- Les fichiers sont stockés sur le serveur FTP configuré
- Les URLs complètes sont stockées en base de données

## 🛠️ Technologies utilisées

### Backend
- Spring Boot 3.2.0
- PostgreSQL
- JPA/Hibernate
- Apache Commons Net (FTP)
- Thumbnailator (optimisation d'images)
- Swagger/OpenAPI

### Frontend
- Angular 20
- TailwindCSS
- Material Icons
- Chart.js

## 📝 Notes

- Les données sensibles (FTP, email, database) sont dans `application.properties` qui n'est pas versionné
- Utilisez `application.properties.example` comme référence
- Consultez `backend/CONFIGURATION.md` pour la configuration détaillée

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est destiné à l'usage interne de l'association étudiante du CCNB.
