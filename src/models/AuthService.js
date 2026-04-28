// Modelo: AuthService.js
// Este archivo contiene la lógica de negocio para la autenticación usando Firebase Auth.
// Maneja el login de usuarios, incluyendo soporte para autenticación de doble factor (MFA).
// Ahora extendido para incluir Firestore y gestión de roles de usuario.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteField,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

class AuthService {
  // Método auxiliar para generar token de 3 caracteres
  generateToken() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 3; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
  // Método para login con email y contraseña
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      return { success: true, user };
    } catch (error) {
      // Si el usuario no tiene contraseña pero existe con Google
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        return {
          success: false,
          errorCode: error.code,
          error: "Usuario no encontrado. ¿Quieres registrarte ahora?",
          suggestion: "provider",
        };
      }
      if (error.code === "auth/wrong-password") {
        return {
          success: false,
          errorCode: error.code,
          error: "Contraseña incorrecta",
          suggestion: "password",
        };
      }
      console.error("Error en login:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para registro con email y contraseña
  async registerWithEmail(email, password, name) {
    try {
      console.log("🔐 Iniciando registro con email:", email);

      // Validar que name no esté vacío
      if (!name || name.trim() === "") {
        throw new Error("El nombre es requerido para el registro");
      }

      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("✅ Usuario creado en Auth:", user.uid);

      // 2. Crear documento en Firestore
      const userData = {
        email: user.email,
        name: name.trim(),
        role: "comensal",
        status: "active",
        createdAt: serverTimestamp(),
      };

      console.log("📝 Creando documento en Firestore:", userData);
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("✅ Documento creado exitosamente en Firestore");

      // Enviar email de bienvenida
      await this.sendWelcomeEmail(user.email, user.displayName || name);

      return { success: true, user };
    } catch (error) {
      console.error("❌ Error en registro:", error.code, error.message);

      // Manejar errores específicos de Firebase
      if (error.code === "auth/email-already-in-use") {
        return {
          success: false,
          errorCode: error.code,
          error: "Este email ya está registrado. ¿Quieres iniciar sesión?",
          suggestion: "login",
        };
      }
      if (error.code === "auth/weak-password") {
        return {
          success: false,
          errorCode: error.code,
          error: "La contraseña es demasiado débil. Usa al menos 6 caracteres.",
          suggestion: "password",
        };
      }
      if (error.code === "auth/invalid-email") {
        return {
          success: false,
          errorCode: error.code,
          error: "El email no es válido.",
          suggestion: "email",
        };
      }

      return { success: false, error: error.message };
    }
  }

  // Método para logout
  async logout() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error("Error en logout:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para obtener el usuario actual
  getCurrentUser() {
    return auth.currentUser;
  }

  // Nuevo: Método para obtener el rol del usuario desde Firestore
  async getUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data().role; // 'admin' o 'comensal'
      } else {
        // Si no existe, crear con valores por defecto
        const currentUser = auth.currentUser;
        await setDoc(doc(db, "users", uid), {
          email: currentUser.email,
          name: currentUser.displayName || "Usuario",
          role: "comensal",
          status: "active",
          createdAt: serverTimestamp(),
        });
        return "comensal";
      }
    } catch (error) {
      console.error("Error obteniendo rol de usuario:", error);
      return "comensal"; // Fallback
    }
  }

  // Nuevo: Método para actualizar el rol del usuario (solo para admin)
  async updateUserRole(uid, newRole) {
    try {
      await setDoc(doc(db, "users", uid), { role: newRole }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando rol:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para login con Google
  async loginWithGoogle() {
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Verificar si el usuario existe en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let isNewUser = false;

      if (!userDoc.exists()) {
        isNewUser = true;
        // Crear documento del usuario con rol 'comensal' por defecto
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          role: "comensal",
          status: "active",
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        });

        // Enviar email de bienvenida
        await this.sendWelcomeEmail(user.email, user.displayName);
      }

      // IMPORTANTE: Siempre requerir que el usuario cree una contraseña
      // para poder acceder con email/password en el futuro
      return { success: true, user, isNewUser, requiresPassword: true };
    } catch (error) {
      console.error("Error en login con Google:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para enviar email de bienvenida
  async sendWelcomeEmail(email, displayName) {
    try {
      const response = await fetch(
        "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/sendWelcomeEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            displayName: displayName,
          }),
        },
      );

      if (!response.ok) {
        console.error("Error enviando email:", response.statusText);
      }
    } catch (error) {
      console.error("Error enviando email:", error);
      // No fallar el registro si el email no se envía
    }
  }

  // Método para solicitar reset de contraseña con token
  async requestPasswordReset(email) {
    try {
      console.log("🔐 Solicitando reset de contraseña para:", email);

      // Generar token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos

      console.log("📧 Enviando email con token...");

      // Enviar email con token
      const response = await fetch(
        "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/sendPasswordResetEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            token: token,
          }),
        },
      );

      if (!response.ok) {
        console.error("Error enviando email de reset:", response.statusText);
        return {
          success: false,
          error: "Error al enviar el email de recuperación",
        };
      }

      // Guardar token en Firestore en una colección temporal
      await setDoc(doc(db, "passwordResets", email), {
        token: token,
        expiresAt: expiresAt,
        email: email,
      });

      console.log("✅ Email de reset enviado exitosamente");
      return {
        success: true,
        message: `Token enviado a ${email}. Expira en 15 minutos.`,
      };
    } catch (error) {
      console.error("❌ Error en reset de contraseña:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Método para validar token y resetear contraseña
  async resetPasswordWithToken(email, token, newPassword) {
    try {
      console.log("🔐 Validando token para:", email);

      // Obtener documento de reset
      const resetDoc = await getDoc(doc(db, "passwordResets", email));

      if (!resetDoc.exists()) {
        return {
          success: false,
          error: "No hay solicitud de reset activa para este email",
        };
      }

      const resetData = resetDoc.data();

      // Validar token
      if (resetData.token !== token.toUpperCase()) {
        return { success: false, error: "El token es incorrecto" };
      }

      // Validar que no haya expirado
      if (new Date() > new Date(resetData.expiresAt.toDate())) {
        await deleteDoc(doc(db, "passwordResets", email));
        return { success: false, error: "El token ha expirado" };
      }

      // Obtener usuario por email
      const userQuerySnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", email)),
      );

      if (userQuerySnapshot.empty) {
        return { success: false, error: "Usuario no encontrado" };
      }

      // Usar Firebase Admin SDK en el backend para cambiar la contraseña
      // Por ahora, guardamos una solicitud de cambio que será procesada por un Cloud Function
      const response = await fetch(
        "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/resetPasswordWithToken",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            newPassword: newPassword,
            token: token,
          }),
        },
      );

      if (!response.ok) {
        console.error("Error reseteando contraseña:", response.statusText);
        return { success: false, error: "Error al resetear la contraseña" };
      }

      // El Cloud Function se encarga de eliminar el documento de reset
      // No necesitamos eliminarlo desde el cliente

      console.log("✅ Contraseña reseteada exitosamente");
      return { success: true, message: "Contraseña actualizada exitosamente" };
    } catch (error) {
      console.error("❌ Error validando token:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Método para que usuarios con Google agreguen una contraseña (para poder entrar con email/password)
  async addPasswordToGoogleUser(password) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No hay usuario autenticado" };
      }

      console.log("🔐 Agregando contraseña al usuario de Google:", user.email);

      // Usar updatePassword de Firebase Auth
      await updatePassword(user, password);
      console.log("✅ Contraseña agregada exitosamente");

      return { success: true, message: "Contraseña creada exitosamente" };
    } catch (error) {
      console.error("❌ Error agregando contraseña:", error.message);

      if (error.code === "auth/weak-password") {
        return {
          success: false,
          error: "La contraseña es demasiado débil. Usa al menos 6 caracteres.",
        };
      }
      if (error.code === "auth/requires-recent-login") {
        return {
          success: false,
          error:
            "Necesitas iniciar sesión nuevamente para cambiar la contraseña",
        };
      }

      return { success: false, error: error.message };
    }
  }
}

const authService = new AuthService();
export default authService;
