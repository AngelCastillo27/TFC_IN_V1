// Vista: ReservationsView.js
// Componente para gestionar reservas (CRUD).

import React, { useState } from 'react';
import useReservations from '../controllers/useReservations';
import useTables from '../controllers/useTables';

const ReservationsView = ({ role, userId }) => {
  const { reservations, loading, error, createReservation, updateReservation, deleteReservation } = useReservations(role === 'comensal' ? userId : null);
  const { tables } = useTables();
  const [formData, setFormData] = useState({ date: '', time: '', numPeople: 1, tableId: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, userId };
    if (editingId) {
      await updateReservation(editingId, data);
      setEditingId(null);
    } else {
      await createReservation(data);
    }
    setFormData({ date: '', time: '', numPeople: 1, tableId: '' });
  };

  const handleEdit = (reservation) => {
    setFormData({
      date: reservation.date,
      time: reservation.time,
      numPeople: reservation.numPeople,
      tableId: reservation.tableId
    });
    setEditingId(reservation.id);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Reservas</h2>
      {(role === 'admin' || role === 'comensal') && (
        <form onSubmit={handleSubmit}>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Número de personas"
            value={formData.numPeople}
            onChange={(e) => setFormData({ ...formData, numPeople: parseInt(e.target.value) })}
            min="1"
            required
          />
          <select
            value={formData.tableId}
            onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
            required
          >
            <option value="">Seleccionar mesa</option>
            {tables.filter(table => table.available).map(table => (
              <option key={table.id} value={table.id}>Mesa {table.number}</option>
            ))}
          </select>
          <button type="submit">{editingId ? 'Actualizar' : 'Reservar'}</button>
          {editingId && <button onClick={() => setEditingId(null)}>Cancelar</button>}
        </form>
      )}
      <ul>
        {reservations.map(reservation => (
          <li key={reservation.id}>
            Fecha: {reservation.date}, Hora: {reservation.time}, Personas: {reservation.numPeople}, Mesa: {reservation.tableId}
            {(role === 'admin' || reservation.userId === userId) && (
              <>
                <button onClick={() => handleEdit(reservation)}>Editar</button>
                <button onClick={() => deleteReservation(reservation.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReservationsView;