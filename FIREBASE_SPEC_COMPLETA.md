# 🏮 DRAGON PALACE - ESPECIFICACIÓN FIREBASE COMPLETA 🏮

## ========================================
## PARTE 1: FIREBASE FIRESTORE - COLECCIONES Y ESTRUCTURA
## ========================================

### Nombres exactos de colecciones (case-sensitive):

```
users
menus
offers
tables
reservations
```

---

### 1. COLECCIÓN: `users`
**Documento ID**: `{uid}` (el UID de Firebase Auth)

**Estructura exacta del documento**:
```json
{
  "email": "usuario@example.com",
  "name": "Nombre del Usuario",
  "role": "comensal",        // Valores: "comensal" | "admin"
  "status": "active",         // Valores: "active" | "inactive"
  "createdAt": "2026-04-24T10:30:00Z",
  "photoURL": "https://..."   // Opcional
}
```

**Reglas de acceso**:
- Crear: Solo el propietario al registrarse
- Leer: El propietario o un admin
- Editar: El propietario o un admin
- Eliminar: Solo admin

---

### 2. COLECCIÓN: `menus`
**Documento ID**: Autogenerado por Firestore

**Estructura exacta del documento**:
```json
{
  "name": "Nombre del Plato",
  "description": "Descripción detallada",
  "price": 12.99,              // Número (no string)
  "category": "Platos Principales",  // Valores: "Entradas", "Platos Principales", "Postres", "Bebidas", "Otros"
  "allergens": ["gluten", "frutos secos"],  // Array de strings
  "imageUrl": "https://...",   // URL de imagen (opcional)
  "available": true,           // Boolean
  "createdAt": "2026-04-24T10:30:00Z",
  "updatedAt": "2026-04-24T10:30:00Z"
}
```

**Reglas de acceso**:
- Leer: Público (sin login)
- Crear/Editar/Eliminar: Solo admin

---

### 3. COLECCIÓN: `offers`
**Documento ID**: Autogenerado por Firestore

**Estructura exacta del documento**:
```json
{
  "title": "Descuento de Verano",
  "description": "Descripción de la oferta",
  "discount": 15,             // Porcentaje (número)
  "startDate": "2026-04-24",  // Formato: YYYY-MM-DD
  "endDate": "2026-05-24",    // Formato: YYYY-MM-DD
  "active": true,             // Boolean
  "dishIds": ["id1", "id2"],  // Array de IDs de platos
  "createdAt": "2026-04-24T10:30:00Z",
  "updatedAt": "2026-04-24T10:30:00Z"
}
```

**Reglas de acceso**:
- Leer: Público (sin login)
- Crear/Editar/Eliminar: Solo admin

---

### 4. COLECCIÓN: `tables`
**Documento ID**: `mesa-1` hasta `mesa-20` (EXACTAMENTE así, con guion)

**Estructura exacta del documento**:
```json
{
  "tableNumber": 1,           // Número (1-20)
  "number": 1,                // Número (igual a tableNumber)
  "capacity": 4,              // Capacidad de personas (número)
  "active": true,             // Boolean (si está operativa)
  "available": true,          // Boolean (si está libre)
  "reservationCount": 0,      // Número de reservas activas
  "createdAt": "2026-04-24T10:30:00Z"
}
```

**Reglas de acceso**:
- Leer: Solo usuarios logueados
- Crear/Editar/Eliminar: Solo admin

---

### 5. COLECCIÓN: `reservations`
**Documento ID**: Autogenerado por Firestore

**Estructura exacta del documento**:
```json
{
  "userId": "uid-del-usuario",       // UID de Firebase Auth
  "tableId": "mesa-5",               // ID de la mesa (mesa-1 a mesa-20)
  "date": "2026-05-15",              // Formato: YYYY-MM-DD
  "time": "19:30",                   // Formato: HH:MM (24h)
  "numPeople": 4,                    // Número de personas
  "status": "activa",                // Valores: "activa" | "cancelada"
  "createdAt": "2026-04-24T10:30:00Z"
}
```

**Reglas de acceso**:
- Leer: El propietario o admin
- Crear: Solo usuario logueado (solo con su propio userId)
- Editar: El propietario o admin
- Eliminar: El propietario o admin

---

## ========================================
## PARTE 2: FIREBASE RULES FIRESTORE EXACTAS
## ========================================

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    function isLoggedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow create: if isOwner(uid);
      allow read:   if isOwner(uid) || isAdmin();
      allow update: if isOwner(uid) || isAdmin();
      allow delete: if isAdmin();
    }

    match /menus/{menuId} {
      allow read:   if true;
      allow create, update, delete: if isAdmin();
    }

    match /offers/{offerId} {
      allow read:   if true;
      allow create, update, delete: if isAdmin();
    }

    match /tables/{tableId} {
      allow read:   if isLoggedIn();
      allow create, update, delete: if isAdmin();
    }

    match /reservations/{reservationId} {
      allow read:   if isLoggedIn() &&
                       (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isLoggedIn() &&
                       request.resource.data.userId == request.auth.uid;
      allow update: if isLoggedIn() &&
                       (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if isLoggedIn() &&
                       (resource.data.userId == request.auth.uid || isAdmin());
    }
  }
}
```

---

## ========================================
## PARTE 3: FIREBASE INDEXES
## ========================================

```json
{
  "indexes": [
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tableId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "menus",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "available", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "offers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "endDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "tables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "tableNumber", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## ========================================
## PARTE 4: CLOUD FUNCTIONS EXACTAS
## ========================================

```javascript
const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10, region: "us-central1" });

// 1. TRIGGER: onUserCreated
exports.onUserCreated = onDocumentCreated("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const data = event.data?.data();

  if (!data) {
    logger.warn("onUserCreated: documento vacio para uid", uid);
    return;
  }

  logger.info("Nuevo usuario registrado:", { uid, email: data.email, role: data.role });

  if (!data.role) {
    await db.collection("users").doc(uid).update({ role: "comensal" });
    logger.info("Rol asignado por defecto: comensal a", uid);
  }
});

// 2. HTTP: sendWelcomeEmail
exports.sendWelcomeEmail = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  try {
    const { email, displayName } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email es obligatorio" });
      return;
    }

    const name = displayName || email.split("@")[0];

    // AQUI conectar con SendGrid, Resend, o Nodemailer
    // Por ahora: simulado
    logger.info("EMAIL DE BIENVENIDA:", { to: email, name, subject: "Bienvenido a Dragon Palace" });

    res.status(200).json({
      success: true,
      message: "Email enviado a " + email,
    });
  } catch (error) {
    logger.error("Error enviando email:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. TRIGGER: onReservationWrite
exports.onReservationWrite = onDocumentWritten("reservations/{reservationId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();

  const tableIdBefore = before?.tableId || null;
  const tableIdAfter = after?.tableId || null;

  const updateTableCount = async (tableId) => {
    if (!tableId) return;
    try {
      const snap = await db.collection("reservations")
        .where("tableId", "==", tableId)
        .where("status", "!=", "cancelada")
        .get();

      await db.collection("tables").doc(tableId).update({
        reservationCount: snap.size,
      });

      logger.info("Mesa actualizada:", { tableId, reservationCount: snap.size });
    } catch (err) {
      logger.error("Error actualizando mesa:", { tableId, err: err.message });
    }
  };

  if (tableIdBefore && tableIdBefore !== tableIdAfter) {
    await updateTableCount(tableIdBefore);
  }
  if (tableIdAfter) {
    await updateTableCount(tableIdAfter);
  }
});

// 4. HTTP: initTables
exports.initTables = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Solo POST" });
    return;
  }

  try {
    const capacities = [
      2, 2, 4, 4, 4,
      4, 4, 6, 6, 6,
      6, 4, 4, 4, 4,
      8, 8, 2, 2, 10,
    ];

    const batch = db.batch();

    for (let i = 1; i <= 20; i++) {
      const tableRef = db.collection("tables").doc("mesa-" + i);
      const existing = await tableRef.get();
      
      if (existing.exists) {
        logger.info("Mesa ya existe, saltando:", i);
        continue;
      }

      batch.set(tableRef, {
        tableNumber: i,
        number: i,
        capacity: capacities[i - 1] || 4,
        active: true,
        available: true,
        reservationCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    logger.info("20 mesas inicializadas correctamente.");

    res.status(200).json({
      success: true,
      message: "Mesas inicializadas correctamente.",
    });
  } catch (error) {
    logger.error("Error inicializando mesas:", error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## ========================================
## PARTE 5: AUTENTICACIÓN FIREBASE
## ========================================

**Métodos soportados**:
- Email/Contraseña
- Google OAuth

**Campos en Auth**:
- `uid`: Identificador único
- `email`: Correo del usuario
- `displayName`: Nombre (opcional)

**Documento en Firestore correspondiente**:
Se crea automáticamente en `users/{uid}` con:
- `email`
- `name`
- `role` ("comensal" por defecto)
- `status` ("active")
- `createdAt` (timestamp del servidor)

---

## ========================================
## PARTE 6: DEPLOY EXACTO
## ========================================

### Paso 1: Login a Firebase
```bash
firebase login
```

### Paso 2: Deploy de Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Paso 3: Deploy de Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### Paso 4: Deploy de Cloud Functions
```bash
firebase deploy --only functions
```

### Paso 5: Inicializar 20 mesas
```bash
curl -X POST https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/initTables
```

---

## ========================================
## PARTE 7: LIBRERÍAS NECESARIAS
## ========================================

**Ya instaladas**:
- firebase: ^9.22.0
- react-router-dom: ^6
- @dataconnect/generated: 1.0.0

**Necesarias (si faltan)**:
- firebase-admin: ^11.10.1
- firebase-functions: ^4.5.0 o superior
- @sendgrid/mail: ^7.7.0 (OPCIONAL, solo si usas SendGrid para emails)

### Instalación:
```bash
npm install
npm install -g firebase-tools
npm install --save-dev firebase-functions firebase-admin
```

---

## ========================================
## PARTE 8: FIREBASE CONFIG
## ========================================

**firebaseConfig.js** (ya está listo):
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJlw0_SqfqQgVW6-uh3CqVezbEHgXuUeU",
  authDomain: "digitalizacion-tsinge-fusion.firebaseapp.com",
  databaseURL: "https://digitalizacion-tsinge-fusion-default-rtdb.firebaseio.com",
  projectId: "digitalizacion-tsinge-fusion",
  storageBucket: "digitalizacion-tsinge-fusion.firebasestorage.app",
  messagingSenderId: "887873128698",
  appId: "1:887873128698:web:d6712b585b72abd05fa143",
  measurementId: "G-YVD5CX2BMV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## ========================================
## PARTE 9: RESUMEN DE CAMBIOS NECESARIOS EN CÓDIGO
## ========================================

1. **Menu.js**: Cambiar `localStorage.getItem("user")` por `useAuth()`
2. **Confirmación**: Todas las vistas usan `useAuth()`, `useReservations()`, `useTables()` correctamente
3. **Deploy**: Ejecutar los 5 pasos de deploy en orden exacto
4. **Librerías**: Instalar firebase-admin y firebase-functions en functions/

---

**FIN DE ESPECIFICACIÓN FIREBASE**
