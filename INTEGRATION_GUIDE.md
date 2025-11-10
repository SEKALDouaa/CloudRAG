# Guide d'Intégration Frontend-Backend CloudRAG

##  Modifications Effectuées

### Backend (Python/Flask)
1. **CORS configuré** pour `http://localhost:5173` (port Vite par défaut)
   - Fichier: `app/__init__.py:20`

### Frontend (React/Vite)
1. **Service API centralisé** créé dans `frontend/src/services/api.js`
   - Configuration axios avec intercepteurs JWT
   - Gestion automatique des tokens
   - Redirection auto si token expiré

2. **Store d'authentification** (Zustand) dans `frontend/src/stores/authStore.js`
   - Login/Register/Logout
   - Gestion du token JWT
   - État global de l'utilisateur

3. **Pages d'authentification**:
   - `LoginPage.jsx` - Connexion
   - `RegisterPage.jsx` - Inscription
   - `ProtectedRoute.jsx` - Protection des routes

4. **Composants fonctionnels**:
   - `DocumentUpload.jsx` - Upload de documents avec drag & drop
   - `ChatInterface.jsx` - Interface de chat RAG

5. **Routes mises à jour** dans `App.jsx`
   - Routes publiques: `/`, `/login`, `/register`
   - Routes protégées: `/documents`, `/chat`

6. **URL API configurée** dans `frontend/.env`
   - `VITE_API_URL=http://localhost:5000`

---

## Installation et Démarrage

### 1️ Backend Python

#### Installation des dépendances
```bash
# Activer l'environnement virtuel
cd C:\Users\nouha\Documents\CloudRAG
.\venv\Scripts\activate

# Installer les dépendances (si pas déjà fait)
pip install -r app/requirements.txt
```

#### Vérifier les variables d'environnement
Le fichier `app/.env` doit contenir:
```env
GEMINI_API_KEY=votre_clé_api
DATABASE_URL=sqlite:///C:/Users/nouha/Documents/CloudRAG/app/db/instance/resumes.db
JWT_SECRET_KEY=une_cle_secrete_aleatoire_123456789
```

#### Lancer le backend
```bash
# Depuis la racine du projet
python run.py
```

Le backend démarre sur **http://localhost:5000**

---

### 2️ Frontend React

#### Installation des dépendances
```bash
# Ouvrir un nouveau terminal
cd frontend
npm install
```

#### Vérifier la configuration
Le fichier `frontend/.env` doit contenir:
```env
VITE_API_URL=http://localhost:5000
```

#### Lancer le frontend
```bash
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

---

##  Test de l'Intégration

### Étape 1: Créer un compte
1. Ouvrir http://localhost:5173
2. Cliquer sur "Créer un compte" ou aller sur `/register`
3. Entrer un email et mot de passe (min 6 caractères)
4. Cliquer sur "Créer un compte"

### Étape 2: Se connecter
1. Aller sur `/login`
2. Entrer vos identifiants
3. Vous serez redirigé vers `/documents`

### Étape 3: Uploader un document
1. Sur la page Documents (`/documents`)
2. Glisser-déposer un fichier PDF, DOCX ou TXT
3. Cliquer sur "Uploader"
4. Vérifier que le message de succès apparaît

### Étape 4: Tester le chat
1. Aller sur la page Chat (`/chat`)
2. Poser une question sur vos documents
3. L'IA devrait répondre en se basant sur vos documents uploadés

---

##  Endpoints API Disponibles

### Authentification
- `POST /register` - Inscription
- `POST /login` - Connexion (retourne JWT)
- `PUT /update-llm` - Mise à jour du modèle LLM (protégé)

### Documents
- `POST /process-document` - Upload document (protégé)
- `GET /document/<id>` - Métadonnées (protégé)
- `GET /document_file/<id>` - Fichier (protégé)
- `GET /all_document_files` - Tous les documents (protégé)

### RAG/Chat
- `POST /ask` - Poser une question (protégé)
  - Body: `{"query": "votre question"}`

---

##  Dépannage

###  Erreur CORS
**Problème**: Les requêtes sont bloquées par CORS

**Solution**: Vérifier que:
- Le backend est configuré pour `http://localhost:5173` (ligne 20 de `app/__init__.py`)
- Le backend est bien lancé sur le port 5000
- Le frontend utilise bien le port 5173

###  Token expiré / Non authentifié
**Problème**: Redirection automatique vers `/login`

**Solution**:
- Les tokens JWT expirent après 1h (configurable dans `app/config.py:10`)
- Se reconnecter pour obtenir un nouveau token

###  Upload échoue
**Problème**: L'upload de document ne fonctionne pas

**Solution**: Vérifier que:
1. Vous êtes bien connecté (JWT valide)
2. Le backend a les permissions d'écriture dans `/tmp`
3. Le fichier est au bon format (PDF, DOCX, TXT)

###  Le chat ne répond pas
**Problème**: Pas de réponse ou erreur lors du chat

**Solution**:
1. Vérifier que vous avez uploadé au moins un document
2. Vérifier que `GEMINI_API_KEY` est configurée dans `app/.env`
3. Vérifier les logs du backend pour voir les erreurs

---

##  Prochaines Étapes

### Améliorations Possibles
1. **Afficher la liste des documents uploadés** sur la page Documents
2. **Historique des conversations** dans le chat
3. **Suppression de documents**
4. **Configuration du modèle LLM** depuis l'interface (endpoint déjà disponible)
5. **Indicateur de statut** du backend dans l'interface
6. **Tests unitaires** pour le frontend et backend

### Déploiement
1. Configurer les variables d'environnement de production
2. Utiliser un vrai serveur de base de données (PostgreSQL, MySQL)
3. Configurer HTTPS
4. Déployer le backend (Heroku, DigitalOcean, AWS, etc.)
5. Déployer le frontend (Vercel, Netlify, etc.)
6. Mettre à jour CORS avec les vraies URLs

---

##  Notes Importantes

1. **Sécurité**:
   - Ne JAMAIS commiter le fichier `.env` avec les vraies clés API
   - Changer `JWT_SECRET_KEY` en production
   - Utiliser HTTPS en production

2. **Base de données**:
   - SQLite est OK pour le développement
   - Passer à PostgreSQL ou MySQL en production

3. **Clé API Gemini**:
   - La clé actuelle est dans `app/.env`
   - Vérifier les quotas et limites de l'API

4. **Authentification**:
   - Tous les endpoints sauf `/login` et `/register` nécessitent un JWT
   - Le token est automatiquement ajouté aux requêtes par axios

---

##  Structure des Fichiers Créés

```
CloudRAG/
├── app/
│   ├── __init__.py          # ✏️ MODIFIÉ: CORS port 5173
│   └── .env                 # Variables d'environnement backend
│
├── frontend/
│   ├── .env                 # ✏️ MODIFIÉ: API URL port 5000
│   ├── src/
│   │   ├── App.jsx          # ✏️ MODIFIÉ: Routes + Protection
│   │   ├── services/
│   │   │   └── api.js       # ✨ NOUVEAU: Service API centralisé
│   │   ├── stores/
│   │   │   └── authStore.js # ✨ NOUVEAU: Store authentification
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx    # ✨ NOUVEAU
│   │   │   ├── DocumentUpload.jsx    # ✨ NOUVEAU
│   │   │   ├── ChatInterface.jsx     # ✨ NOUVEAU
│   │   │   └── layout/
│   │   │       └── Layout.jsx        # ✏️ MODIFIÉ: Auth UI
│   │   └── pages/
│   │       ├── LoginPage.jsx         # ✨ NOUVEAU
│   │       ├── RegisterPage.jsx      # ✨ NOUVEAU
│   │       ├── DocumentsPage.jsx     # ✏️ MODIFIÉ: Upload
│   │       └── ChatPage.jsx          # ✏️ MODIFIÉ: Chat
│   └── package.json
│
└── INTEGRATION_GUIDE.md     # ✨ NOUVEAU: Ce fichier
```

---

Bonne chance avec votre projet CloudRAG! 
