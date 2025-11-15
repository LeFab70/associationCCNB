# Backend - Association des Étudiants CCNB

Application Spring Boot pour gérer les propositions, avis et contacts de l'association.

## Configuration

1. **Base de données PostgreSQL**
   - Créer une base de données : `association_etudiant_ccnb`
   - Modifier les credentials dans `src/main/resources/application.properties`

2. **Email (optionnel)**
   - Configurer les paramètres SMTP dans `application.properties`
   - L'email est désactivé si non configuré (pas d'erreur)

3. **Dossier uploads**
   - Le dossier `uploads/` sera créé automatiquement
   - Les fichiers sont servis via `/uploads/{filename}`

## Lancer l'application

```bash
mvn spring-boot:run
```

L'API sera accessible sur `http://localhost:8080`

## Structure

- `entity/` - Entités JPA (Proposal, Review, Contact, Vote)
- `repository/` - Repositories Spring Data
- `service/` - Services métier
- `controller/` - Controllers REST
- `dto/` - Data Transfer Objects
- `config/` - Configuration (CORS, File Storage)

