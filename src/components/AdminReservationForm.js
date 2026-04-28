// Componente: AdminReservationForm.js
// Formulario para que el admin cree reservas en nombre de otros usuarios

import React, { useState, useEffect } from "react";
import ReservationService from "../models/ReservationService";
import UserService from "../models/UserService";
import "../styles/ChineseStyle.css";

const AdminReservationForm = ({ onReservationCreated }) => {
  const [formData, setFormData] = useState({
    userEmail: "",
    reservationDate: "",
    reservationTime: "",
    numberOfPeople: 2,
    specialRequests: "",
  });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cargar usuarios al montar
  useEffect(() => {
    loadUsers();
  }, []);

  // Cargar mesas disponibles cuando cambia fecha/hora
  useEffect(() => {
    if (formData.reservationDate && formData.reservationTime) {
      loadAvailableTables();
    }
  }, [formData.reservationDate, formData.reservationTime]);

  // Cargar lista de usuarios
  const loadUsers = async () => {
    try {
      const result = await UserService.getAllUsers();
      if (result.success) {
        setUsers(result.users);
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  // Cargar mesas disponibles
  const loadAvailableTables = async () => {
    try {
      const result = await ReservationService.getAvailableTables(
        formData.reservationDate,
        formData.reservationTime
      );

      if (result.success) {
        const filtered = result.tables.filter(
          (table) => table.capacity >= formData.numberOfPeople
        );
        setAvailableTables(filtered);
        if (filtered.length > 0) {
          setSelectedTable(filtered[0].id);
        }
      }
    } catch (err) {
      console.error("Error cargando mesas:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfPeople" ? parseInt(value) : value,
    }));
    setError(null);
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    setFormData((prev) => ({
      ...prev,
      userEmail: user?.email || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!selectedUser) {
      setError("Por favor selecciona un usuario");
      return;
    }

    if (!formData.reservationDate) {
      setError("Por favor selecciona una fecha");
      return;
    }

    if (!formData.reservationTime) {
      setError("Por favor selecciona una hora");
      return;
    }

    if (!selectedTable) {
      setError("No hay mesas disponibles para esta fecha y hora");
      return;
    }

    if (formData.numberOfPeople < 1 || formData.numberOfPeople > 10) {
      setError("El número de personas debe estar entre 1 y 10");
      return;
    }

    setLoading(true);

    try {
      const reservationData = {
        userId: selectedUser.id,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        tableId: selectedTable,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        numberOfPeople: formData.numberOfPeople,
        specialRequests: formData.specialRequests,
        status: "confirmada", // Admin la crea directamente confirmada
      };

      const result = await ReservationService.createReservation(reservationData);

      if (result.success) {
        setSuccess(true);
        setFormData({
          userEmail: "",
          reservationDate: "",
          reservationTime: "",
          numberOfPeople: 2,
          specialRequests: "",
        });
        setSelectedUser(null);
        setSelectedTable(null);
        setAvailableTables([]);

        if (onReservationCreated) {
          onReservationCreated(result.reservationId);
        }

        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.error || "Error al crear la reserva");
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <div className="reservation-form-container">
      <div className="reservation-form-card">
        <h2>📅 Crear Reserva para Usuario</h2>

        {error && <div className="error-message error-box">❌ {error}</div>}
        {success && (
          <div className="success-message success-box">
            ✅ ¡Reserva creada exitosamente!
          </div>
        )}

        <form onSubmit={handleSubmit} className="reservation-form">
          {/* Usuario */}
          <div className="form-group">
            <label htmlFor="userSelect">Seleccionar Usuario</label>
            <select
              id="userSelect"
              value={selectedUser?.id || ""}
              onChange={handleUserChange}
              required
            >
              <option value="">-- Selecciona un usuario --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div className="form-group">
            <label htmlFor="reservationDate">Fecha</label>
            <input
              id="reservationDate"
              type="date"
              name="reservationDate"
              value={formData.reservationDate}
              onChange={handleInputChange}
              min={today}
              max={maxDateString}
              required
            />
          </div>

          {/* Hora */}
          <div className="form-group">
            <label htmlFor="reservationTime">Hora</label>
            <select
              id="reservationTime"
              name="reservationTime"
              value={formData.reservationTime}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona una hora</option>
              <option value="12:00">12:00 - Mediodía</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="18:00">18:00 - Tarde</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
              <option value="21:00">21:00</option>
              <option value="22:00">22:00</option>
              <option value="23:00">23:00</option>
            </select>
          </div>

          {/* Número de personas */}
          <div className="form-group">
            <label htmlFor="numberOfPeople">Número de personas</label>
            <input
              id="numberOfPeople"
              type="number"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              onChange={handleInputChange}
              min="1"
              max="10"
              required
            />
          </div>

          {/* Mesas disponibles */}
          {availableTables.length > 0 && (
            <div className="form-group">
              <label htmlFor="selectedTable">Mesa disponible</label>
              <select
                id="selectedTable"
                value={selectedTable || ""}
                onChange={(e) => setSelectedTable(e.target.value)}
                required
              >
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.tableNumber} - Capacidad: {table.capacity} personas
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Solicitudes especiales */}
          <div className="form-group">
            <label htmlFor="specialRequests">Solicitudes especiales (opcional)</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              placeholder="Ej: Cumpleaños, aniversario, alergias, etc."
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading || availableTables.length === 0}
            className="btn-primary btn-full-width"
          >
            {loading ? "Creando reserva..." : "Crear Reserva"}
          </button>
        </form>

        {availableTables.length === 0 && formData.reservationDate && formData.reservationTime && (
          <div className="info-message">
            ℹ️ No hay mesas disponibles para la fecha y hora seleccionadas
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReservationForm;
