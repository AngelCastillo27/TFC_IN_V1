# CONFIGURACIÓN NECESARIA

## 1. OBTENER GOOGLE CLIENT ID

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Autenticación" → "Proveedores"
4. Habilita "Google"
5. En "Web SDK configuration", copia tu Client ID
6. Reemplaza "AQUI_VA_TU_GOOGLE_CLIENT_ID" en `src/index.js` con tu ID

Ejemplo:

```
clientId="123456789-abc.apps.googleusercontent.com"
```

## 2. CONFIGURAR SENDGRID PARA EMAILS

1. Ve a [SendGrid](https://sendgrid.com/) y crea una cuenta gratuita
2. Obtén tu API Key
3. Ve a [Firebase Console](https://console.firebase.google.com/)
4. Ve a "Configuración" → "Variables de entorno"
5. Agrega una nueva variable:
   - Nombre: `SENDGRID_API_KEY`
   - Valor: Tu API Key de SendGrid

## 3. DESPLEGAR CLOUD FUNCTIONS

### Opción A: Con Firebase CLI (Recomendado)

1. Instala Firebase CLI:

   ```
   npm install -g firebase-tools
   ```

2. Inicia sesión:

   ```
   firebase login
   ```

3. Inicializa Cloud Functions en tu proyecto:

   ```
   firebase init functions
   ```

4. Reemplaza el contenido de `functions/index.js` con el código en `CLOUD_FUNCTION_TEMPLATE.js`

5. Instala dependencias en la carpeta functions:

   ```
   cd functions
   npm install @sendgrid/mail
   cd ..
   ```

6. Despliega:

   ```
   firebase deploy --only functions
   ```

7. Copia la URL de tu función Cloud y reemplaza:
   - `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendWelcomeEmail`
     en el archivo `src/models/AuthService.js` con tu URL real

### Opción B: Sin Firebase CLI (Usando Firebase Console)

1. Ve a Firebase Console → Cloud Functions
2. Crea una nueva función
3. Copia el código de `CLOUD_FUNCTION_TEMPLATE.js`
4. Reemplaza `YOUR_PROJECT_ID` con tu ID de proyecto en `AuthService.js`

## 4. VERIFICAR QUE TODO FUNCIONA

1. Ejecuta `npm start`
2. Intenta registrarte con email/contraseña
3. Intenta inicia sesión con Google
4. Verifica que recibas el email de bienvenida

## NOTAS

- El plan gratuito de SendGrid permite 100 emails/día
- Los emails pueden tardar unos minutos en llegar
- Si no recibes emails, revisa la carpeta de spam
- Asegúrate que las APIs de Autenticación de Google estén habilitadas en Google Cloud Console
