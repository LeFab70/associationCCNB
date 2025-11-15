# Projet Web Interactif - Association des Étudiants CCNB

Application web interactive pour l'Association des Étudiants du Collège communautaire du Nouveau-Brunswick (CCNB) - Campus de Bathurst.

## Technologies utilisées

### Backend
- **Spring Boot 3.2.0** - Framework Java
- **PostgreSQL** - Base de données
- **JPA/Hibernate** - ORM
- **Spring Mail** - Envoi d'emails

### Frontend
- **Angular 20** - Framework avec Signals
- **TailwindCSS** - Framework CSS
- **Lucide Angular** - Bibliothèque d'icônes

## Structure du projet

```
associationEtudiantCCNB/
├── backend/          # Application Spring Boot
└── frontend/         # Application Angular
```

## Configuration et installation

### Prérequis
- Java 17+
- Maven 3.6+
- Node.js 18+
- PostgreSQL 12+

### Backend

1. **Configurer PostgreSQL**
   - Créer une base de données : `association_etudiant_ccnb`
   - Modifier les credentials dans `backend/src/main/resources/application.properties`

2. **Configurer l'email** (optionnel)
   - Modifier les paramètres SMTP dans `application.properties`
   - Par défaut, l'email est désactivé si non configuré

3. **Lancer l'application**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   L'application sera accessible sur `http://localhost:8080`

### Frontend

1. **Installer les dépendances**
   ```bash
   cd frontend
   npm install
   ```

2. **Lancer l'application**
   ```bash
   npm start
   ```
   L'application sera accessible sur `http://localhost:4200`

## Fonctionnalités

### 1. Module Propositions
- Formulaire pour soumettre des propositions (nom, texte, photo optionnelle)
- Affichage dynamique de toutes les propositions
- Système de vote avec compteur
- Sauvegarde instantanée

### 2. Module Avis et Photos
- Formulaire pour partager des avis après activités
- Upload d'images (JPEG/PNG)
- Galerie d'avis visible par tous
- Modération possible par l'administrateur

### 3. Module Contact
- Formulaire de contact (nom, email, message)
- Enregistrement en base de données
- Envoi automatique d'email à l'association

### 4. Interface Admin
- Consultation de toutes les propositions, avis et contacts
- Tri par date
- Suppression d'entrées
- Modération des avis (approuver/désapprouver)
- Marquer les contacts comme lus

## Configuration de la base de données

Le fichier `application.properties` contient la configuration par défaut :
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/association_etudiant_ccnb
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## Stockage des fichiers

Les fichiers uploadés (photos) sont stockés dans le dossier `uploads/` à la racine du backend. Ce dossier est créé automatiquement au premier upload.

## API Endpoints

### Propositions
- `GET /api/proposals` - Liste des propositions
- `POST /api/proposals` - Créer une proposition
- `POST /api/proposals/{id}/vote` - Voter pour une proposition
- `DELETE /api/proposals/{id}` - Supprimer (admin)

### Avis
- `GET /api/reviews` - Liste des avis approuvés
- `GET /api/reviews/admin` - Tous les avis (admin)
- `POST /api/reviews` - Créer un avis
- `PUT /api/reviews/{id}/approval` - Toggle approbation (admin)
- `DELETE /api/reviews/{id}` - Supprimer (admin)

### Contacts
- `GET /api/contacts/admin` - Liste des contacts (admin)
- `POST /api/contacts` - Créer un contact
- `PUT /api/contacts/{id}/read` - Marquer comme lu (admin)
- `DELETE /api/contacts/{id}` - Supprimer (admin)

## Notes importantes

- Les votes sont basés sur l'adresse IP pour éviter les votes multiples
- Les avis sont approuvés par défaut, mais peuvent être modérés
- L'envoi d'email nécessite une configuration SMTP valide
- Les images sont servies via `/uploads/{filename}`

## Développement

Pour le développement, les deux applications doivent être lancées simultanément :
- Backend sur le port 8080
- Frontend sur le port 4200

Le frontend est configuré pour communiquer avec le backend sur `http://localhost:8080`.

## Date d'achèvement estimée

Le projet est fonctionnel et prêt pour les tests. La date d'achèvement finale dépendra des tests et ajustements nécessaires.

