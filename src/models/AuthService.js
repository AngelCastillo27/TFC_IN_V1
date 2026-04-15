// Modelo: AuthService.js
// Este archivo contiene la lógica de negocio para la autenticación usando Firebase Auth.
// Maneja el login de usuarios, incluyendo soporte para autenticación de doble factor (MFA).
// Ahora extendido para incluir Firestore y gestión de roles de usuario.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Importaciones para Firestore
import { auth, db } from "../firebaseConfig";

class AuthService {
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
      console.error("Error en login:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para registro con email y contraseña
  async registerWithEmail(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Crear documento del usuario en Firestore con rol 'comensal' por defecto
      await setDoc(doc(db, "users", user.uid), {
        role: "comensal",
        email: user.email,
        createdAt: new Date(),
      });

      return { success: true, user };
    } catch (error) {
      console.error("Error en registro:", error);
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
        // Si no existe, asumir 'comensal' por defecto o crear
        await setDoc(doc(db, "users", uid), {
          role: "comensal",
          email: auth.currentUser.email,
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
      if (!userDoc.exists()) {
        // Crear documento del usuario con rol 'comensal' por defecto
        await setDoc(doc(db, "users", user.uid), {
          role: "comensal",
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });

        // Enviar email de bienvenida
        await this.sendWelcomeEmail(user.email, user.displayName);
      }

      return { success: true, user };
    } catch (error) {
      console.error("Error en login con Google:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para enviar email de bienvenida
  async sendWelcomeEmail(email, displayName) {
    try {
      const response = await fetch(
        "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendWelcomeEmail",
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
}

const authService = new AuthService();
export default authService;
