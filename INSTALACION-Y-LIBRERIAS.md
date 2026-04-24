# 📦 GUÍA COMPLETA DE INSTALACIÓN Y DEPENDENCIAS

## ✅ YA INSTALADO

En `c:\tfc_d2\package.json` ya están todas las dependencias correctas:

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "firebase": "^9.22.0",
    "@dataconnect/generated": "1.0.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.x"
  }
}
```

---

## 🔧 PASO 1: Instalar dependencias del Frontend

```bash
cd c:\tfc_d2
npm install
```

**Qué instala**:
- React y React DOM
- React Router para navegación
- Firebase SDK para autenticación y Firestore
- DataConnect generado
- React Scripts para build

**Tiempo**: 2-3 minutos
**Confirmación**: "added XXX packages" sin errores

---

## ⚙️ PASO 2: Instalar Firebase CLI Global

```bash
npm install -g firebase-tools
```

**Qué es**: Herramienta de línea de comandos para desplegar en Firebase

**Verificar**:
```bash
firebase --version
```

**Expected output**:
```
firebase-tools/13.x.x
```

---

## ☁️ PASO 3: Instalar dependencias de Cloud Functions

```bash
cd c:\tfc_d2\functions
npm install
```

**Qué instala**:
- firebase-admin: SDK administrativo para Node.js
- firebase-functions: Framework para Cloud Functions
- @types/node: Tipos de TypeScript

**package.json necesario en functions/**:
```json
{
  "name": "functions",
  "version": "1.0.0",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^11.10.1",
    "firebase-functions": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

**Si no existe**, créalo manualmente ejecutando:
```bash
cd c:\tfc_d2\functions
npm init -y
npm install firebase-admin@11.10.1 firebase-functions@4.5.0
```

---

## 📋 RESUMEN DE INSTALACIONES

### Frontend (c:\tfc_d2)
```bash
npm install
# Instala ~800 paquetes en node_modules/
# Tamaño: ~500 MB
# Dependencias: React, Firebase, Router
```

### Firebase CLI (global)
```bash
npm install -g firebase-tools
# Instala herramienta de deploy
# Tamaño: ~50 MB
```

### Cloud Functions (c:\tfc_d2\functions)
```bash
npm install
# Instala ~100 paquetes en node_modules/
# Tamaño: ~100 MB
# Dependencias: Firebase Admin, Functions
```

---

## ✅ VERIFICACIÓN

Después de instalar, verifica:

### 1. Frontend está listo
```bash
cd c:\tfc_d2
npm start
```

**Expected**: Abre http://localhost:3000 en el navegador
**Expected**: Ningún error en la consola

### 2. Firebase CLI está listo
```bash
firebase --version
firebase projects:list
```

**Expected**: Muestra versión (ej: 13.x.x)
**Expected**: Lista de proyectos de Firebase

### 3. Cloud Functions están listos
```bash
cd c:\tfc_d2\functions
npm run build    # Si existe script build (opcional)
firebase functions:describe
```

---

## 🚀 ORDEN CORRECTO DE INSTALACIÓN

### Para empezar por primera vez:

```bash
# 1. Frontend
cd c:\tfc_d2
npm install

# 2. Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# 3. Cloud Functions
cd c:\tfc_d2\functions
npm install

# 4. Test local
cd ..
npm start

# 5. Deploy (después de test local)
firebase login
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions
curl -X POST https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/initTables
```

---

## 📊 TAMAÑO FINAL

```
c:\tfc_d2\node_modules\        ~500 MB
c:\tfc_d2\functions\node_modules\ ~100 MB
c:\tfc_d2\.next (si build)     ~200 MB (después de build)
─────────────────────────────────────
Total local: ~800 MB
```

---

## 🔍 VALIDACIÓN DE INSTALACIÓN

Para confirmar que todo está instalado correctamente:

```bash
# Frontend
ls c:\tfc_d2\node_modules\react
ls c:\tfc_d2\node_modules\firebase

# CLI
firebase --version

# Functions
ls c:\tfc_d2\functions\node_modules\firebase-admin
ls c:\tfc_d2\functions\node_modules\firebase-functions
```

---

## ⚠️ SI ALGO FALLA

### Error: "command not found: firebase"
```bash
npm install -g firebase-tools
```

### Error: "Cannot find module 'firebase'"
```bash
cd c:\tfc_d2
npm install
```

### Error: "ENOENT: no such file or directory"
```bash
# Elimina node_modules y vuelve a instalar
rm -r node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"
```bash
# Usa otro puerto
npm start -- --port 3001
```

### Error en Cloud Functions
```bash
cd c:\tfc_d2\functions
npm install
npm run build    # Si existe
```

---

## 📝 ARCHIVOS QUE SE CREARÁN

Después de `npm install`:

```
c:\tfc_d2\
├── node_modules\              (500 MB)
├── package-lock.json          (generado)
│
c:\tfc_d2\functions\
├── node_modules\              (100 MB)
└── package-lock.json          (generado)
```

---

## ✨ RESUMEN FINAL

| Paso | Comando | Tiempo | Tamaño |
|------|---------|--------|--------|
| 1 | `npm install` | 2-3 min | 500 MB |
| 2 | `npm install -g firebase-tools` | 1 min | 50 MB |
| 3 | `cd functions && npm install` | 1 min | 100 MB |
| **Total** | **3 comandos** | **~5 min** | **~650 MB** |

---

## 🎯 PRÓXIMOS PASOS

Una vez instalado todo:

1. Ejecutar `npm start` para probar local
2. Ejecutar `firebase login` para autenticarse
3. Ejecutar los comandos de deploy

Ver `PLAN-FINAL-100.md` para pasos exactos del deploy.

---

**Está todo listo. Solo instala y despliega.** 🚀
