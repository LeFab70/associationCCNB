# Guide de Configuration

## Configuration PostgreSQL

### Problème : "role postgres does not exist"

Si vous obtenez l'erreur `FATAL: role "postgres" does not exist`, voici comment la résoudre :

#### Option 1 : Créer l'utilisateur postgres
```bash
# Se connecter à PostgreSQL en tant qu'utilisateur superadmin
psql postgres

# Créer l'utilisateur postgres
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER USER postgres CREATEDB;
ALTER USER postgres WITH SUPERUSER;
\q
```

#### Option 2 : Utiliser votre utilisateur PostgreSQL existant

Modifiez `backend/src/main/resources/application.properties` :

```properties
# Remplacez 'postgres' par votre nom d'utilisateur PostgreSQL
spring.datasource.username=votre_utilisateur
spring.datasource.password=votre_mot_de_passe
```

### Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE association_etudiant_ccnb;

# Vérifier qu'elle existe
\l

# Quitter
\q
```

## Lancer les applications

### Backend
```bash
cd backend
mvn spring-boot:run
```

Le backend sera accessible sur :
- API : http://localhost:8080/api
- Swagger UI : http://localhost:8080/swagger-ui.html
- API Docs : http://localhost:8080/api-docs

### Frontend
```bash
cd frontend
npm start
```

Le frontend sera accessible sur : http://localhost:4200

## Accès Swagger

Une fois le backend démarré, accédez à :
- **Swagger UI** : http://localhost:8080/swagger-ui.html
- **API Docs JSON** : http://localhost:8080/api-docs

Swagger vous permet de :
- Voir toutes les API disponibles
- Tester les endpoints directement
- Voir les modèles de données (DTOs en records)

