# 📱 WhatsApp Clone - Backend API

API REST et WebSocket pour l'application de messagerie instantanée (Clone WhatsApp).
Gère l'authentification, les messages en temps réel, les fichiers et les contacts.

## 🛠️ Stack Technique

- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB (Mongoose)
- **Temps Réel** : Socket.io
- **Sécurité** : JWT, Bcrypt

## 🚀 Démarrage Rapide

1.  **Installation**

    ```bash
    npm install
    ```

2.  **Configuration**
    Copiez le fichier d'exemple et ajustez les variables (Mongo URI, etc.) :

    ```bash
    cp .env.example .env
    ```

3.  **Lancement (Dev)**
    ```bash
    npm run dev
    ```
    Le serveur sera accessible sur `http://localhost:3000`.

## 📖 Documentation

Une documentation détaillée des endpoints API est disponible dans [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## ✅ Fonctionnalités Clés

- 🔐 **Authentification** : Inscription, Connexion, Profil.
- 💬 **Messagerie** : Chat 1-1, Historique, Statuts (Lu/Distribué).
- ⚡ **Temps Réel** : Socket.io pour les messages et statuts en direct.
- 📁 **Fichiers** : Upload d'images, vidéos et documents.
- 👥 **Contacts** : Demandes d'amis, Liste de contacts, Blocage.

# WhatsApp Clone API - Messagerie Temps Réel

API REST et WebSocket pour application de messagerie instantanée avec gestion de contacts, notifications, et partage de fichiers. Développée avec Express.js, Socket.io, MongoDB et JWT.

## 🚀 Fonctionnalités

### Authentification & Profil

- ✓ Inscription avec email, username, mot de passe
- ✓ Connexion avec JWT (tokens valides 7 jours)
- ✓ Hashage bcrypt des mots de passe
- ✓ Validation des données entrantes
- ✓ Gestion des statuts online/offline
- ✓ Changement de mot de passe sécurisé
- ✓ Mise à jour du profil (username, email, avatar)
- ✓ Recherche d'utilisateurs avec pagination

### Messagerie

- ✓ Messages privés 1-to-1
- ✓ Envoi/réception en temps réel (WebSocket)
- ✓ Historique de conversations
- ✓ Statuts des messages avec timestamps (envoyé, reçu, lu)
- ✓ Édition de messages (délai 15 minutes)
- ✓ Suppression de messages (soft delete)
- ✓ Pagination (30 messages/page)
- ✓ Maximum 5000 caractères par message
- ✓ Recherche full-text dans les messages avec filtres
- ✓ Compteur de messages non lus

### Gestion de Contacts

- ✓ Système de demande/acceptation de contacts
- ✓ Liste des contacts acceptés avec pagination
- ✓ Demandes de contact en attente
- ✓ Blocage/déblocage de contacts
- ✓ Liste des contacts bloqués
- ✓ Recherche de contacts avec filtres de statut
- ✓ Protection: utilisateurs bloqués ne peuvent pas envoyer de messages

### Notifications

- ✓ Système de notifications centralisé
- ✓ Notifications automatiques pour demandes de contact
- ✓ Notifications automatiques pour acceptation de contact
- ✓ Notifications automatiques pour nouveaux messages
- ✓ Marquage individuel comme lu
- ✓ Marquage global (tous les messages lus)
- ✓ Filtrage par statut (lu/non lu)
- ✓ Suppression de notifications
- ✓ Pagination des notifications

### Gestion de Fichiers

- ✓ Upload de fichiers (images, documents, vidéos, audio)
- ✓ Génération automatique de miniatures pour images
- ✓ Streaming de fichiers avec mise en cache
- ✓ Support MIME types variés
- ✓ Optimisation Sharp pour images
- ✓ Validation de taille et type de fichiers

### Temps Réel (WebSocket)

- ✓ Indicateur "en train d'écrire..."
- ✓ Statut de présence (online/offline)
- ✓ Notifications de lecture avec confirmations
- ✓ Mise à jour automatique des conversations
- ✓ Synchronisation des statuts via WebSocket
- ✓ Gestion des connexions multiples par utilisateur

## 📋 Prérequis

- Node.js 14+
- MongoDB 4.4+ (Atlas ou local)
- npm ou yarn

## 🔧 Installation

```bash
# Cloner le projet
git clone <repository-url>
cd api

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

## ⚙️ Configuration

Fichier `.env` :

```env
NODE_ENV=development
PORT=3000

# Production database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/whatsapp?retryWrites=true&w=majority

# Test database (utilisée automatiquement avec NODE_ENV=test)
MONGODB_TEST_URI=mongodb+srv://user:password@cluster.mongodb.net/whatsapp-test?retryWrites=true&w=majority

JWT_SECRET=votre_secret_jwt_tres_securise
```

## 🏃 Lancement

### Développement

```bash
npm run dev
```

### Production

```bash
npm start
```

### Tests

```bash
# Tous les tests avec coverage
npm test

# Tests en mode watch
npm run test:watch

# Linting
npm run lint

# Format code
npm run format
```

Le serveur démarre sur `http://localhost:3000`

## 📚 Documentation API

### Base URL

```
http://localhost:3000/api
```

### Authentification

#### POST /api/auth/register

Inscription d'un nouvel utilisateur

**Body:**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "avatar": "https://example.com/avatar.jpg" // Optionnel
}
```

**Réponse (201):**

```json
{
  "message": "Inscription réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@example.com",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "status": "offline",
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

#### POST /api/auth/login

Connexion d'un utilisateur

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse (200):**

```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    /* ... */
  }
}
```

#### POST /api/auth/logout

Déconnexion (nécessite authentification)

**Headers:**

```
Authorization: Bearer <token>
```

**Réponse (200):**

```json
{
  "message": "Déconnexion réussie"
}
```

#### GET /api/auth/me

Obtenir les informations de l'utilisateur connecté

**Headers:**

```
Authorization: Bearer <token>
```

**Réponse (200):**

```json
{
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "johndoe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "status": "online"
  }
}
```

### Utilisateurs

#### GET /api/users

Lister tous les utilisateurs (paginé)

**Headers:**

```
Authorization: Bearer <token>
```

**Query params:**

- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 20)

**Réponse (200):**

```json
{
  "users": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "username": "johndoe",
      "avatar": "https://example.com/avatar.jpg",
      "status": "online"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

#### GET /api/users/:id

Obtenir un utilisateur par ID

**Réponse (200):**

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "username": "johndoe",
  "email": "user@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "status": "online",
  "lastConnection": "2025-11-03T10:00:00.000Z"
}
```

#### PUT /api/users/profile

Mettre à jour son profil

**Body:**

```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Réponse (200):**

```json
{
  "message": "Profil mis à jour",
  "user": {
    /* ... */
  }
}
```

#### PUT /api/users/change-password

Changer son mot de passe

**Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Réponse (200):**

```json
{
  "message": "Mot de passe modifié avec succès"
}
```

#### GET /api/users/search

Rechercher des utilisateurs

**Query params:**

- `query` (requis, minimum 2 caractères)

**Exemple:**

```http
GET /api/users/search?query=john
```

### Contacts

#### POST /api/contacts/request

Envoyer une demande de contact

**Headers:**

```http
Authorization: Bearer <token>
```

**Body:**

```json
{
  "contactId": "64a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Réponse (201):**

```json
{
  "message": "Demande de contact envoyée",
  "contact": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
    "userId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "contactId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "status": "pending"
  }
}
```

#### PUT /api/contacts/:id/accept

Accepter une demande de contact

**Réponse (200):**

```json
{
  "message": "Contact accepté",
  "contact": {
    /* ... */
  }
}
```

#### DELETE /api/contacts/:id

Supprimer un contact

**Réponse (200):**

```json
{
  "message": "Contact supprimé"
}
```

#### GET /api/contacts

Lister tous les contacts acceptés

**Query params:**

- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 50)

**Réponse (200):**

```json
{
  "contacts": [
    {
      "id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "contact": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
        "username": "johndoe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "status": "online"
      },
      "status": "accepted",
      "acceptedAt": "2025-11-03T10:00:00.000Z"
    }
  ],
  "total": 42
}
```

#### GET /api/contacts/pending

Lister les demandes de contact en attente

**Réponse (200):**

```json
{
  "contacts": [
    /* ... */
  ]
}
```

#### POST /api/contacts/:id/block

Bloquer un contact

**Réponse (200):**

```json
{
  "message": "Contact bloqué",
  "contact": {
    /* ... */
  }
}
```

#### POST /api/contacts/:id/unblock

Débloquer un contact

**Réponse (200):**

```json
{
  "message": "Contact débloqué",
  "contact": {
    /* ... */
  }
}
```

#### GET /api/contacts/blocked

Lister tous les contacts bloqués

**Réponse (200):**

```json
{
  "contacts": [
    {
      "id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "contact": {
        /* ... */
      },
      "status": "blocked",
      "blockedAt": "2025-11-03T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/contacts/search

Rechercher dans ses contacts

**Query params:**

- `query` (requis, minimum 2 caractères)
- `status` (optionnel: pending, accepted, blocked)
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 50)

**Exemple:**

```http
GET /api/contacts/search?query=john&status=accepted
```

**Réponse (200):**

```json
{
  "contacts": [
    /* ... */
  ],
  "total": 5,
  "page": 1,
  "limit": 50,
  "pages": 1
}
```

### Messages

#### POST /api/messages

Créer un nouveau message

**Body:**

```json
{
  "recipient_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "content": "Hello, comment ça va ?"
}
```

**Réponse (201):**

```json
{
  "message": "Message créé",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "sender": {
      /* ... */
    },
    "recipient": {
      /* ... */
    },
    "content": "Hello, comment ça va ?",
    "receivedAt": null,
    "readAt": null,
    "edited": false,
    "deleted": false,
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

#### GET /api/messages/:user_id

Récupérer les messages avec un utilisateur (marque automatiquement les messages comme lus)

**Query params:**

- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 30)

**Réponse (200):**

```json
{
  "messages": [
    /* ... */
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 156,
    "pages": 6
  }
}
```

#### GET /api/messages/conversations

Lister toutes les conversations avec nombre de messages non lus

**Réponse (200):**

```json
{
  "conversations": [
    {
      "_id": {
        /* user object */
      },
      "lastMessage": {
        /* message object */
      },
      "unreadCount": 3
    }
  ]
}
```

#### PUT /api/messages/:id

Éditer un message (propriétaire seulement, délai 15 minutes)

**Body:**

```json
{
  "content": "Message modifié"
}
```

#### DELETE /api/messages/:id

Supprimer un message (soft delete, propriétaire seulement)

**Réponse (200):**

```json
{
  "message": "Message supprimé"
}
```

#### POST /api/messages/:id/read

Marquer un message comme lu (destinataire seulement)

**Réponse (200):**

```json
{
  "message": "Message marqué comme lu",
  "data": {
    /* ... */
  }
}
```

#### GET /api/messages/search

Rechercher dans les messages

**Query params:**

- `query` (requis, minimum 2 caractères)
- `user_id` (optionnel, filtrer par conversation)
- `startDate` (optionnel, date ISO format)
- `endDate` (optionnel, date ISO format)
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 30)

**Exemple:**

```http
GET /api/messages/search?query=hello&user_id=64a1b2c3d4e5f6g7h8i9j0k1
```

**Réponse (200):**

```json
{
  "messages": [
    /* ... */
  ],
  "total": 15,
  "page": 1,
  "limit": 30,
  "pages": 1
}
```

### Notifications

#### GET /api/notifications

Lister toutes les notifications

**Headers:**

```http
Authorization: Bearer <token>
```

**Query params:**

- `unread` (optionnel, boolean)
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 20)

**Réponse (200):**

```json
{
  "notifications": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k5",
      "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "type": "contact_request",
      "message": "johndoe vous a envoyé une demande de contact",
      "relatedUser": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
        "username": "johndoe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "read": false,
      "createdAt": "2025-11-03T10:00:00.000Z"
    }
  ],
  "total": 10,
  "unread": 5
}
```

#### PUT /api/notifications/:id/read

Marquer une notification comme lue

**Réponse (200):**

```json
{
  "message": "Notification marquée comme lue",
  "notification": {
    /* ... */
  }
}
```

#### PUT /api/notifications/read-all

Marquer toutes les notifications comme lues

**Réponse (200):**

```json
{
  "message": "Toutes les notifications ont été marquées comme lues",
  "modifiedCount": 5
}
```

#### DELETE /api/notifications/:id

Supprimer une notification

**Réponse (200):**

```json
{
  "message": "Notification supprimée"
}
```

### Fichiers

#### POST /api/messages

Envoi de fichiers avec message (multipart/form-data)

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**

- `recipient_id` (string, requis)
- `content` (string, optionnel)
- `files` (files, maximum 10 fichiers)

**Réponse (201):**

```json
{
  "message": "Message créé",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "content": "Voici mes photos",
    "files": [
      {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k7",
        "filename": "photo.jpg",
        "mimetype": "image/jpeg",
        "size": 245678,
        "path": "/uploads/files/abc123.jpg",
        "thumbnail": "/uploads/thumbnails/abc123_thumb.jpg"
      }
    ]
  }
}
```

#### GET /api/files/:id

Télécharger un fichier

**Headers:**

```http
Authorization: Bearer <token>
```

**Réponse (200):**

Stream du fichier avec headers appropriés (Content-Type, Cache-Control, ETag)

## 🔌 Événements WebSocket

### Connexion

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' },
});
```

### Événements côté client

#### send-message

Envoyer un message

```javascript
socket.emit('send-message', {
  recipient_id: '64a1b2c3d4e5f6g7h8i9j0k1',
  content: 'Hello!',
});
```

#### message-received

Confirmer la réception d'un message

```javascript
socket.emit('message-received', {
  message_id: '64a1b2c3d4e5f6g7h8i9j0k2',
});
```

#### message-read

Marquer un message comme lu

```javascript
socket.emit('message-read', {
  message_id: '64a1b2c3d4e5f6g7h8i9j0k2',
});
```

#### edit-message

Éditer un message (délai 15 minutes)

```javascript
socket.emit('edit-message', {
  message_id: '64a1b2c3d4e5f6g7h8i9j0k2',
  content: 'Message modifié',
});
```

#### typing

Indiquer qu'on est en train d'écrire

```javascript
socket.emit('typing', {
  recipient_id: '64a1b2c3d4e5f6g7h8i9j0k1',
  isTyping: true, // ou false
});
```

#### get-user-status

Demander le statut d'un utilisateur

```javascript
socket.emit('get-user-status', {
  user_id: '64a1b2c3d4e5f6g7h8i9j0k1',
});
```

### Événements côté serveur

#### new-message

Réception d'un nouveau message

```javascript
socket.on('new-message', (message) => {
  console.log('Nouveau message:', message);
});
```

#### message-sent

Confirmation d'envoi

```javascript
socket.on('message-sent', (data) => {
  console.log('Message envoyé:', data.message);
});
```

#### message-received-confirmation

Confirmation que le message a été reçu

```javascript
socket.on('message-received-confirmation', (data) => {
  console.log('Message reçu:', data.message_id);
  console.log('Timestamp:', data.receivedAt);
});
```

#### message-read-confirmation

Notification de lecture

```javascript
socket.on('message-read-confirmation', (data) => {
  console.log('Message lu:', data.message_id);
  console.log('Timestamps:', data.receivedAt, data.readAt);
});
```

#### message-edited

Confirmation d'édition de message

```javascript
socket.on('message-edited', (data) => {
  if (data.success) {
    console.log('Message édité:', data.message);
  }
});
```

#### message-updated

Notification qu'un message a été édité par l'autre utilisateur

```javascript
socket.on('message-updated', (data) => {
  console.log('Message mis à jour:', data.message);
});
```

#### user-typing

Notification de frappe

```javascript
socket.on('user-typing', (data) => {
  console.log(data.username, "est en train d'écrire...");
});
```

#### user-status

Changement de statut utilisateur

```javascript
socket.on('user-status', (data) => {
  console.log(data.username, 'est', data.status);
});
```

#### error

Erreur WebSocket

```javascript
socket.on('error', (error) => {
  console.error('Erreur:', error.message);
});
```

## 🗂️ Structure du Projet

```text
api/
├── src/
│   ├── models/
│   │   ├── User.js              # Modèle utilisateur (bcrypt, indexes)
│   │   ├── Message.js           # Modèle message (timestamps, text search index)
│   │   ├── Contact.js           # Modèle contact (demandes, blocage)
│   │   ├── Notification.js      # Modèle notification
│   │   └── File.js              # Modèle fichier
│   ├── routes/
│   │   ├── auth.js              # Routes authentification
│   │   ├── users.js             # Routes utilisateurs
│   │   ├── messages.js          # Routes messages
│   │   ├── contacts.js          # Routes contacts
│   │   ├── notifications.js     # Routes notifications
│   │   └── files.js             # Routes fichiers
│   ├── controllers/
│   │   ├── authController.js    # Logique authentification
│   │   ├── userController.js    # Logique utilisateurs
│   │   ├── messageController.js # Logique messages (CRUD, search)
│   │   ├── contactController.js # Logique contacts (blocage, recherche)
│   │   ├── notificationController.js # Logique notifications
│   │   └── fileController.js    # Logique fichiers (streaming)
│   ├── middleware/
│   │   └── auth.js              # Middleware JWT
│   ├── socket/
│   │   └── handlers.js          # Handlers WebSocket
│   ├── utils/
│   │   └── fileUtils.js         # Utilitaires fichiers (Sharp, thumbnails)
│   ├── app.js                   # Configuration Express + MongoDB
│   ├── config.js                # Configuration centralisée
│   └── server.js                # Serveur HTTP + Socket.io
├── test/
│   ├── setup.js                 # Configuration tests
│   ├── models.test.js           # Tests modèles
│   ├── auth.test.js             # Tests authentification
│   ├── messages.test.js         # Tests messages
│   ├── contacts.test.js         # Tests contacts
│   ├── notifications.test.js    # Tests notifications
│   ├── websocket.test.js        # Tests WebSocket
│   └── helpers/
│       ├── client.ts            # Helper clients de test
│       ├── user.ts              # Fixtures utilisateurs
│       └── message.ts           # Fixtures messages
├── uploads/
│   ├── files/                   # Fichiers uploadés
│   └── thumbnails/              # Miniatures générées
├── public/
│   ├── index.html               # Interface utilisateur
│   ├── stylesheets/
│   │   └── style.css            # Styles
│   └── javascripts/
│       └── script.js            # Logique frontend
├── .env                         # Variables d'environnement
├── .env.example                 # Exemple de configuration
├── .eslintrc.json              # Configuration ESLint
├── .prettierrc                  # Configuration Prettier
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Tests

Le projet inclut une suite de tests complète avec **87 tests** qui passent :

### Tests Unitaires (11 tests)

- **Modèle User** : Validation, hashage bcrypt, méthodes (7 tests)
- **Modèle Message** : Validation, soft delete (4 tests)

### Tests d'Intégration (63 tests)

- **Authentification** : Register, login, logout, profil (11 tests)
- **Messages** : CRUD, conversations, pagination, recherche full-text (18 tests)
- **Contacts** : Demandes, acceptation, blocage, recherche (13 tests)
- **Notifications** : Création automatique, marquage lu, suppression (11 tests)
- **Fichiers** : Upload, téléchargement, validation (10 tests)

### Tests WebSocket (13 tests)

- **Connexion** : Authentification, statuts (4 tests)
- **Messages temps réel** : Envoi, réception, confirmations (5 tests)
- **Notifications** : Lecture, frappe, présence (4 tests)

### Lancer les tests

```bash
# Tous les tests avec coverage
npm test

# Tests en mode watch
npm run test:watch

# Linting et formatting
npm run lint
npm run format
```

### Coverage

Les tests utilisent automatiquement une base de données séparée (`MONGODB_TEST_URI`) pour ne pas affecter les données de production. NYC génère un rapport de couverture après chaque exécution.

## 🔒 Sécurité

- ✓ Mots de passe hashés avec bcrypt (salt rounds: 10)
- ✓ Authentification JWT avec expiration (7 jours)
- ✓ Validation des entrées utilisateur (email, longueurs, types)
- ✓ Protection CORS configurée
- ✓ Messages privés isolés (1-to-1 uniquement)
- ✓ Vérification des autorisations (propriétaire pour edit/delete)
- ✓ Vérification du mot de passe actuel avant changement
- ✓ Délai d'édition de 15 minutes pour les messages
- ✓ Base de données de test séparée
- ✓ Validation MIME types pour fichiers
- ✓ Limitation taille fichiers (5MB par défaut)
- ✓ Protection contre les utilisateurs bloqués
- ✓ Soft delete pour messages et contacts
- ✓ Validation des IDs MongoDB
- ✓ ETag et Cache-Control pour fichiers

## 🎯 Améliorations Implémentées

| Catégorie                          | Points | Statut |
| ---------------------------------- | ------ | ------ |
| Structure (Configuration, Modèles) | 2      | ✓      |
| Authentification (JWT, Bcrypt)     | 4      | ✓      |
| Messages (CRUD REST + WebSocket)   | 6      | ✓      |
| Notifications temps réel           | 3      | ✓      |
| Tests (unitaires + intégration)    | 3      | ✓      |
| Documentation + Frontend           | 2      | ✓      |
| **TOTAL**                          | **20** | **✓**  |

## ✨ Fonctionnalités Avancées Implémentées

- ✅ **Édition de messages** : Possibilité de modifier un message dans les 15 minutes suivant l'envoi
- ✅ **Timestamps détaillés** : Suivi précis de l'envoi (createdAt), réception (receivedAt) et lecture (readAt) des messages
- ✅ **Informations de message** : Modal affichant les timestamps détaillés pour chaque message
- ✅ **Statuts visuels** : Icônes SVG pour indiquer l'état des messages (envoyé/reçu/lu)
- ✅ **Thème clair/sombre** : Basculement entre thèmes avec persistance localStorage
- ✅ **Gestion de profil** : Modification du username, email et avatar
- ✅ **Changement de mot de passe** : Formulaire sécurisé avec vérification de l'ancien mot de passe
- ✅ **Menu contextuel** : Menu 3-points sur chaque message pour actions rapides
- ✅ **Base de données de test** : Séparation des données de test et production
- ✅ **UI responsive** : Sidebar mobile avec animation glissante

## 🚀 Technologies Utilisées

### Backend

- **Express.js 4.16.1** : Framework web
- **Socket.io 4.8.1** : Communication temps réel WebSocket
- **MongoDB + Mongoose 8.19.2** : Base de données NoSQL avec indexes
- **JWT (jsonwebtoken 9.0.2)** : Authentification par tokens
- **Bcrypt 6.0.0** : Hashage de mots de passe
- **Multer 2.0.2** : Upload de fichiers multipart/form-data
- **Sharp 0.34.5** : Traitement d'images et génération de miniatures
- **CORS 2.8.5** : Gestion des requêtes cross-origin
- **Dotenv 17.2.3** : Variables d'environnement
- **File-type 21.1.1** : Détection MIME types

### Qualité de Code

- **ESLint 9.39.1** : Linting JavaScript
- **Prettier 3.6.2** : Formatage de code
- **Husky 9.1.7** : Git hooks
- **Lint-staged 16.2.7** : Pre-commit checks
- **Commitlint 20.1.0** : Validation messages de commit

### Tests

- **Mocha 11.7.4** : Framework de tests
- **Chai 6.2.0** : Assertions
- **Supertest 7.1.4** : Tests HTTP
- **Socket.io-client 4.8.1** : Tests WebSocket
- **NYC 17.1.0** : Coverage de code

## 📝 Architecture & Décisions Techniques

### MongoDB Indexes

Indexes créés pour optimiser les performances :

- **Message.content** : Text index pour recherche full-text
- **Message.createdAt** : Index pour filtres de date
- **User.username, User.email** : Compound text index pour recherche
- **User.email, User.username** : Index unique pour validation
- **Contact.userId, Contact.contactId** : Index pour requêtes de contacts

### Gestion des Fichiers

- Upload via Multer en mémoire (buffer)
- Validation MIME type avec file-type
- Génération miniatures automatique (300x300px) pour images
- Streaming optimisé avec mise en cache ETag
- Stockage dans `/uploads` avec structure organisée

### WebSocket vs REST

- **REST** : CRUD operations, recherche, pagination
- **WebSocket** : Temps réel (messages, notifications, présence, frappe)
- Authentification JWT pour les deux canaux
- Confirmations bidirectionnelles pour garantir la livraison

### Soft Delete

- Messages supprimés : `deleted: true`, contenu masqué
- Préserve l'historique et les références
- Fichiers supprimés du système de fichiers

## 🔄 Évolutions Futures

- [ ] Groupes de discussion (création, gestion membres, permissions)
- [ ] Messages vocaux avec enregistrement audio
- [ ] Appels vidéo/audio WebRTC
- [ ] Encryption end-to-end des messages
- [ ] Stories/statuts temporaires
- [ ] Réactions aux messages (emojis)
- [ ] Réponses/citations de messages
- [ ] Backup/export de conversations
- [ ] Mode dark automatique selon l'heure
- [ ] Notifications push (PWA)

## 📄 Licence

MIT

## 👤 Auteur

Développé avec Express.js + Socket.io + MongoDB + JWT

---

**Stack Technique** : Node.js · Express · Socket.io · MongoDB · Mongoose · JWT · Bcrypt · Multer · Sharp · Mocha · Chai
