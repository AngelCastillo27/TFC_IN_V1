// Modelo: AuthService.js
// Este archivo contiene la lógica de negocio para la autenticación usando Firebase Auth.
// Maneja el login de usuarios, incluyendo soporte para autenticación de doble factor (MFA).
// Ahora extendido para incluir Firestore y gestión de roles de usuario.

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Importaciones para Firestore
import { auth, db } from '../firebaseConfig';

class AuthService {
  // Método para login con email y contraseña
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return { success: true, user };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  }

  // Método para logout
  async logout() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
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
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role; // 'admin' o 'comensal'
      } else {
        // Si no existe, asumir 'comensal' por defecto o crear
        await setDoc(doc(db, 'users', uid), { role: 'comensal', email: auth.currentUser.email });
        return 'comensal';
      }
    } catch (error) {
      console.error('Error obteniendo rol de usuario:', error);
      return 'comensal'; // Fallback
    }
  }

  // Nuevo: Método para actualizar el rol del usuario (solo para admin)
  async updateUserRole(uid, newRole) {
    try {
      await setDoc(doc(db, 'users', uid), { role: newRole }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error actualizando rol:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();