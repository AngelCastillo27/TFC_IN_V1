// Modelo: ReservationService.js
// Servicio para gestionar reservas en Firestore

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

class ReservationService {
  // Crear una nueva reserva
  async createReservation(reservationData) {
    try {
      console.log("📅 Creando reserva:", reservationData);

      // Validar que no exista otra reserva en la misma mesa y hora
      const existingReservation = await this.checkReservationConflict(
        reservationData.tableId,
        reservationData.reservationDate,
        reservationData.reservationTime
      );

      if (existingReservation) {
        return {
          success: false,
          error: "Ya existe una reserva para esta mesa en esta fecha y hora",
        };
      }

      const docRef = await addDoc(collection(db, "reservations"), {
        ...reservationData,
        status: "pendiente", // pendiente, confirmada, cancelada, no-asistió
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Reserva creada:", docRef.id);
      return { success: true, reservationId: docRef.id };
    } catch (error) {
      console.error("❌ Error creando reserva:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Verificar conflicto de reserva
  async checkReservationConflict(tableId, date, time) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("tableId", "==", tableId),
          where("reservationDate", "==", date),
          where("reservationTime", "==", time),
          where("status", "!=", "cancelada")
        )
      );

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error verificando conflicto:", error);
      return false;
    }
  }

  // Obtener reservas del usuario
  async getUserReservations(userId) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("userId", "==", userId)
        )
      );

      const reservations = [];
      querySnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, reservations };
    } catch (error) {
      console.error("Error obteniendo reservas:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todas las reservas (para admin)
  async getAllReservations() {
    try {
      const querySnapshot = await getDocs(collection(db, "reservations"));
      const reservations = [];
      querySnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, reservations };
    } catch (error) {
      console.error("Error obteniendo reservas:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener reserva por ID
  async getReservationById(reservationId) {
    try {
      const docSnap = await getDoc(doc(db, "reservations", reservationId));
      if (docSnap.exists()) {
        return {
          success: true,
          reservation: { id: docSnap.id, ...docSnap.data() },
        };
      } else {
        return { success: false, error: "Reserva no encontrada" };
      }
    } catch (error) {
      console.error("Error obteniendo reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar reserva
  async updateReservation(reservationId, updates) {
    try {
      console.log("📝 Actualizando reserva:", reservationId);

      await updateDoc(doc(db, "reservations", reservationId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Reserva actualizada");
      return { success: true };
    } catch (error) {
      console.error("Error actualizando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Cancelar reserva
  async cancelReservation(reservationId) {
    try {
      console.log("❌ Cancelando reserva:", reservationId);

      await updateDoc(doc(db, "reservations", reservationId), {
        status: "cancelada",
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Reserva cancelada");
      return { success: true };
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Confirmar reserva
  async confirmReservation(reservationId) {
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        status: "confirmada",
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error confirmando reserva:", error);
      return { success: false, error: error.message };
    }
  }

  // Marcar como no-asistió
  async markAsNoShow(reservationId) {
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        status: "no-asistió",
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error marcando como no-show:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener reservas por fecha (para admin)
  async getReservationsByDate(date) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("reservationDate", "==", date),
          where("status", "!=", "cancelada")
        )
      );

      const reservations = [];
      querySnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, reservations };
    } catch (error) {
      console.error("Error obteniendo reservas por fecha:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener mesas disponibles para una fecha y hora
  async getAvailableTables(date, time) {
    try {
      // Obtener todas las mesas
      const tablesSnap = await getDocs(collection(db, "tables"));
      const allTables = [];
      tablesSnap.forEach((doc) => {
        if (doc.data().active) {
          allTables.push({ id: doc.id, ...doc.data() });
        }
      });

      // Obtener mesas reservadas
      const reservationsSnap = await getDocs(
        query(
          collection(db, "reservations"),
          where("reservationDate", "==", date),
          where("reservationTime", "==", time),
          where("status", "!=", "cancelada")
        )
      );

      const reservedTableIds = new Set();
      reservationsSnap.forEach((doc) => {
        reservedTableIds.add(doc.data().tableId);
      });

      // Filtrar mesas disponibles
      const availableTables = allTables.filter(
        (table) => !reservedTableIds.has(table.id)
      );

      return { success: true, tables: availableTables };
    } catch (error) {
      console.error("Error obteniendo mesas disponibles:", error);
      return { success: false, error: error.message };
    }
  }
}

const reservationService = new ReservationService();
export default reservationService;
