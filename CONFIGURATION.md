# Configuration du Projet

## Problème de connexion au backend

Si vous voyez le message "Impossible de se connecter au serveur", suivez ces étapes :

### 1. Vérifier le port du backend

Le backend peut tourner sur différents ports selon comment il est lancé :

- **Depuis IntelliJ** : Le port par défaut est souvent **8080** (même si `application.properties` dit 8081)
- **Depuis la ligne de commande** : Utilise le port défini dans `application.properties` (actuellement **8081**)

### 2. Configurer le frontend

Modifiez le fichier `frontend/src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // Changez le port ici (8080 ou 8081)
};
```

### 3. Vérifier que le backend est démarré

- Ouvrez votre navigateur et allez à : `http://localhost:8080/swagger-ui.html` (ou 8081)
- Si Swagger s'affiche, le backend fonctionne
- Si vous obtenez une erreur, le backend n'est pas démarré

### 4. Vérifier les logs du backend

Dans IntelliJ, regardez les logs de démarrage. Vous devriez voir :
```
Tomcat started on port(s): 8080 (http) with context path ''
```
ou
```
Tomcat started on port(s): 8081 (http) with context path ''
```

### 5. Identifiants admin par défaut

- **Username** : `admin`
- **Password** : `admin123`

### 6. Configuration CORS

Le backend est configuré pour accepter les requêtes depuis `http://localhost:4200`.
Si vous utilisez un autre port pour le frontend, modifiez `backend/src/main/resources/application.properties` :

```properties
app.cors.allowed-origins=http://localhost:4200
```

## Résolution rapide

1. Vérifiez sur quel port le backend tourne (regardez les logs IntelliJ)
2. Modifiez `frontend/src/environments/environment.ts` avec le bon port
3. Redémarrez le frontend si nécessaire

