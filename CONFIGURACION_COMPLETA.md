# PASOS PARA COMPLETAR LA CONFIGURACIÓN

## PARTE 1: CONFIGURAR GOOGLE SIGN-IN

### Paso 1: Obtener Google Client ID

1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve al menú lateral → "Compilación" → "Autenticación"
4. Haz clic en la pestaña "Proveedores"
5. Busca "Google" y haz clic en él
6. Haz clic el el switch para habilitar Google
7. En el popup que aparece, verás "Web SDK configuration"
8. Copia tu **Web Client ID** (empieza con números largos seguido de -apps.googleusercontent.com)

### Paso 2: Reemplazar Client ID en el código

1. Abre el archivo `src/index.js`
2. Busca esta línea:
   ```jsx
   <GoogleOAuthProvider clientId="AQUI_VA_TU_GOOGLE_CLIENT_ID">
   ```
3. Reemplaza `AQUI_VA_TU_GOOGLE_CLIENT_ID` con tu Client ID

Ejemplo:

```jsx
<GoogleOAuthProvider clientId="123456789-abcdefghijk.apps.googleusercontent.com">
```

---

## PARTE 2: CONFIGURAR SENDGRID PARA EMAILS

### Paso 1: Crear cuenta en SendGrid

1. Ve a [SendGrid.com](https://sendgrid.com/)
2. Haz clic en "Sign Up" (o "Crear cuenta")
3. Completa el registro con:
   - Email
   - Nombre completo
   - Contraseña
4. Acepta los términos y haz clic en "Crear cuenta"

### Paso 2: Obtener API Key

1. En SendGrid, ve al menú lateral → "Settings" → "API Keys"
2. Haz clic en "Create API Key"
3. Dale un nombre (ejemplo: "Restaurant App")
4. Dale acceso a: "Mail Send" (al menos)
5. Haz clic en "Create & View"
6. **COPIA Y GUARDA tu API Key** en un lugar seguro (lo necesitarás después)

### Paso 3: Verificar email remitente

1. En SendGrid, ve a "Settings" → "Sender Authentication"
2. Haz clic en "Verify a Single Sender"
3. Completa con:
   - From Email: ejemplo@tudominio.com (o una dirección de email que poseas)
   - From Name: "Tu Restaurante"
   - Reply Email: El mismo email
4. Verifica el email siguiendo las instrucciones en tu bandeja de entrada

---

## PARTE 3: DESPLEGAR CLOUD FUNCTIONS

### Opción A: Despliegue Local (Recomendado para principiantes)

#### Paso 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

#### Paso 2: Iniciar sesión en Firebase

```bash
firebase login
```

Se abrirá un navegador para que inices sesión con tu cuenta de Google.

#### Paso 3: Inicializar Cloud Functions

En la carpeta raíz de tu proyecto:

```bash
firebase init functions
```

Responde las preguntas:

- ¿Qué idioma? → **JavaScript**
- ¿Instalar dependencias? → **Y (Sí)**

#### Paso 4: Preparar la función

1. Abre `functions/index.js`
2. Reemplaza TODA su contenido con el código de `CLOUD_FUNCTION_TEMPLATE.js`
3. Abre `functions/package.json`
4. En la sección "dependencies", asegúrate que esté:
   ```json
   "@sendgrid/mail": "^8.1.0"
   ```
   Si no está, agrégalo manualmente y ejecuta:
   ```bash
   cd functions
   npm install
   cd ..
   ```

#### Paso 5: Configurar la API Key de SendGrid

En Firebase Console:

1. Ve a "Compilación" → "Cloud Functions"
2. En la esquina superior derecha, busca "⚙️ Configuración" (en el proyecto)
3. Ve a "Variables de entorno"
4. Haz clic en "Add variable"
5. Completa:
   - **Name**: `SENDGRID_API_KEY`
   - **Value**: Pega tu API Key de SendGrid (la que copiaste anteriormente)
6. Haz clic en "Save"

#### Paso 6: Desplegar

```bash
firebase deploy --only functions
```

Espera a que termine. Verás un mensaje como:

```
✔ Deploy complete!
Function URL (sendWelcomeEmail(us-central1)): https://us-central1-TU_PROJECT_ID.cloudfunctions.net/sendWelcomeEmail
```

**Copia esa URL** (especialmente la parte después del último guión: `TU_PROJECT_ID`)

#### Paso 7: Actualizar AuthService.js

1. Abre `src/models/AuthService.js`
2. Busca esta línea (aproximadamente línea 105):
   ```javascript
   "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendWelcomeEmail";
   ```
3. Reemplaza `YOUR_PROJECT_ID` con tu Project ID (lo que viste en el paso anterior)

Ejemplo:

```javascript
"https://us-central1-tfc-project-12345.cloudfunctions.net/sendWelcomeEmail";
```

---

## PARTE 4: CAMBIAR EMAIL REMITENTE

En el archivo `CLOUD_FUNCTION_TEMPLATE.js`, busca esta línea (aparece 2 veces):

```javascript
from: 'noreply@turestaurant.com', // Cambia esto...
```

Reemplazlo con el email que verificaste en SendGrid. Ejemplo:

```javascript
from: 'contacto@mirestaurante.com',
```

---

## PARTE 5: PROBAR TODO

1. Detén el servidor con `Ctrl+C` en terminal
2. Ejecuta nuevamente:
   ```bash
   npm start
   ```
3. Prueba los siguientes casos:

### Test 1: Registro con Email

- Haz clic en "¿No tienes cuenta? Regístrate"
- Llena email y contraseña
- Haz clic en "Registrarse"
- Deberías recibir un email (revisa spam)

### Test 2: Login con Google

- Haz clic en "Inicia sesión con Google"
- Selecciona tu cuenta de Google
- Deberías ser redirigido al Dashboard
- Deberías recibir un email (revisa spam)

### Test 3: Login con Email/Contraseña

- Usa el email y contraseña que registraste
- Deberías ser redirigido al Dashboard

### Test 4: Logout

- En el Dashboard, haz clic en el botón "🚪 Salir"
- Deberías volver a ver el formulario de login

---

## SOLUCIÓN DE PROBLEMAS

### "No recibo emails"

- Revisa la carpeta de **spam/correo no deseado**
- Verifica que el email remitente esté correctamente verificado en SendGrid
- En SendGrid, ve a "Activity" → "Logs" para ver si los emails se enviaron

### "Error: Client ID is invalid"

- Asegúrate de copiar el Client ID completo de Firebase
- Verifica que no haya espacios en blanco al inicio o final

### "Error en Cloud Function"

- Abre Firebase Console → Cloud Functions
- Haz clic en la función "sendWelcomeEmail"
- Ve a la pestaña "Logs" para ver el error exacto

### "La Cloud Function no existe"

- Asegúrate de haber ejecutado `firebase deploy --only functions`
- Espera unos minutos para que se despliegue completamente

---

## SIGUIENTE PASO

¡Una vez que todo esté funcionando, tu aplicación estará lista para:
✅ Registro con email/contraseña
✅ Login con Google
✅ Envío automático de emails de bienvenida
✅ Sistema completo de reservas
