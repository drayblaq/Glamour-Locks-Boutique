# Système d'Authentification Glamour Locks

## Vue d'ensemble

Le système d'authentification de Glamour Locks a été entièrement corrigé et modernisé. Il utilise maintenant une architecture hybride qui sépare clairement l'authentification des administrateurs et des clients.

## Architecture

### 1. Authentification Admin (NextAuth.js)
- **Framework**: NextAuth.js avec JWT
- **Provider**: Credentials Provider
- **Base de données**: Variables d'environnement (hash bcrypt)
- **Routes protégées**: `/admin/*`
- **Sessions**: JWT tokens avec expiration

### 2. Authentification Client (Custom JWT)
- **Framework**: JWT personnalisé avec Firebase Firestore
- **Base de données**: Firestore (collections `customers` et `customer_auth`)
- **Routes protégées**: `/account`, `/cart/checkout`
- **Sessions**: JWT tokens stockés en localStorage

## Fichiers Modifiés/Créés

### Nouveaux Fichiers
```
src/lib/server-temp-auth.ts          # Service d'authentification JWT
src/hooks/useCustomerAuth.ts         # Hook React pour l'auth client
src/components/auth/ProtectedRoute.tsx # Composant de protection
src/components/layout/UserMenu.tsx   # Menu utilisateur
src/app/api/auth/customer/profile/route.ts # API profil client
src/app/api/auth/customer/orders/route.ts  # API commandes client
src/app/account/page.tsx             # Page compte client
src/scripts/test-auth.js             # Script de test
```

### Fichiers Modifiés
```
src/lib/auth.ts                      # Configuration NextAuth admin
src/middleware.ts                    # Middleware de protection
src/components/types/next-auth.d.ts  # Types NextAuth étendus
src/components/Providers.tsx         # Providers React
src/app/login/page.tsx               # Page connexion client
src/app/register/page.tsx            # Page inscription client
```

## Configuration Requise

### Variables d'Environnement
```bash
# Admin Authentication
ADMIN_EMAIL=admin@glamourlocks.com
ADMIN_PASSWORD_HASH=<bcrypt_hash>
NEXTAUTH_SECRET=<random_32_bytes_base64>

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<api_key>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project_id>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<auth_domain>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storage_bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app_id>
```

### Structure Firestore
```
customers/
  - {customerId}/
    - id: string
    - email: string
    - firstName: string
    - lastName: string
    - phone?: string
    - address?: object
    - createdAt: timestamp
    - updatedAt: timestamp
    - isActive: boolean

customer_auth/
  - {authId}/
    - id: string
    - email: string
    - passwordHash: string
    - customerId: string
    - createdAt: timestamp
    - lastLogin?: timestamp
```

## Utilisation

### Authentification Admin
```typescript
// Login admin via NextAuth
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email: 'admin@example.com',
  password: 'password',
  callbackUrl: '/admin'
});
```

### Authentification Client
```typescript
// Utilisation du hook
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

const { customer, login, logout, isAuthenticated } = useCustomerAuth();

// Login
const result = await login('email@example.com', 'password');

// Logout
logout();
```

### Protection de Routes
```typescript
// Composant protégé
import ProtectedRoute from '@/components/auth/ProtectedRoute';

<ProtectedRoute>
  <MyProtectedComponent />
</ProtectedRoute>
```

### API Routes Client
```typescript
// Requête authentifiée
import { useAuthenticatedFetch } from '@/hooks/useCustomerAuth';

const { authenticatedFetch } = useAuthenticatedFetch();
const response = await authenticatedFetch('/api/auth/customer/profile');
```

## Sécurité

### Mesures Implémentées
- **Rate Limiting**: Protection contre les attaques par force brute
- **Validation d'Entrée**: Sanitisation et validation des données
- **Headers de Sécurité**: CSP, XSS Protection, etc.
- **Hachage de Mots de Passe**: bcrypt avec salt rounds élevés
- **JWT Sécurisés**: Signatures cryptographiques
- **Expiration de Tokens**: Tokens avec durée de vie limitée

### Logging et Monitoring
- **Logs Structurés**: Tous les événements d'auth sont loggés
- **Monitoring des Erreurs**: Tracking des erreurs d'authentification
- **Métriques de Performance**: Mesure des temps de réponse

## Tests

### Exécuter les Tests
```bash
cd apps/main-site
node src/scripts/test-auth.js
```

### Tests Inclus
- Validation des mots de passe
- Génération de secrets JWT
- Validation d'emails
- Configuration d'environnement
- Simulation de tokens

## Déploiement

### Prérequis
1. Configurer les variables d'environnement
2. Initialiser Firebase Firestore
3. Configurer les règles de sécurité Firestore
4. Générer un mot de passe admin hashé

### Script de Configuration Admin
```bash
cd apps/main-site
node src/scripts/setup-admin.js
```

## Maintenance

### Tâches Régulières
- Vérifier les logs d'authentification
- Surveiller les tentatives de connexion échouées
- Mettre à jour les mots de passe admin
- Nettoyer les tokens expirés

### Monitoring
- Utiliser le script de test pour vérifier la santé du système
- Surveiller les métriques de performance
- Analyser les logs d'erreur

## Résolution de Problèmes

### Problèmes Courants
1. **Erreur "Token invalide"**: Vérifier NEXTAUTH_SECRET
2. **Connexion admin échouée**: Vérifier ADMIN_PASSWORD_HASH
3. **Erreur Firebase**: Vérifier la configuration Firebase
4. **Rate limiting**: Attendre la fin de la fenêtre de limitation

### Debug
- Activer `debug: true` dans authOptions pour le développement
- Vérifier les logs dans la console
- Utiliser les outils de développement Firebase

## Évolutions Futures

### Améliorations Possibles
- Intégration OAuth (Google, Facebook)
- Authentification à deux facteurs
- Gestion des rôles utilisateur
- API GraphQL pour l'authentification
- Intégration avec des services de monitoring externes

---

**Note**: Ce système d'authentification est maintenant entièrement fonctionnel et sécurisé. Tous les problèmes identifiés ont été corrigés et le code est prêt pour la production.




