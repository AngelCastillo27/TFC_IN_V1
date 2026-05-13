import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import UserService from "../services/UserService";
import ReservationTableService, {
  RESERVATION_SHIFTS,
  RESERVATION_TIMES,
  RESERVATION_STATUS,
} from "../services/ReservationTableService";
import { Button, Input } from "../components";

const today = new Date().toISOString().split("T")[0];
const defaultFormState = {
  date: today,
  time: "",
  peopleCount: 2,
  specialRequests: "",
  status: RESERVATION_STATUS.CONFIRMED,
};

const AdminReservationsView = () => {
  const { userEmail: adminEmail } = useAuth();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedShift, setSelectedShift] = useState(RESERVATION_SHIFTS.COMIDA);
  const [statusFilter, setStatusFilter] = useState("");

  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationError, setReservationError] = useState(null);

  const [users, setUsers] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [feedback, setFeedback] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);

  const statusOptions = useMemo(
    () => Object.values(RESERVATION_STATUS),
    [],
  );

  const normalizeReservation = (reservation) => ({
    ...reservation,
    date: reservation.date || reservation.reservationDate || "",
    time: reservation.time || reservation.reservationTime || "",
    peopleCount: reservation.peopleCount || reservation.numberOfPeople || 1,
    tableIds: Array.isArray(reservation.tableIds)
      ? reservation.tableIds
      : reservation.tableId
      ? [reservation.tableId]
      : [],
  });

  const filteredUsers = useMemo(() => {
    const term = searchPhone.trim().toLowerCase();
    if (!term) return [];

    return users.filter((user) => {
      const phone = String(user.phone || "").toLowerCase();
      const name = String(user.name || user.displayName || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      return phone.includes(term) || name.includes(term) || email.includes(term);
    });
  }, [searchPhone, users]);

  const resetForm = () => {
    setSelectedReservation(null);
    setFormState(defaultFormState);
    setSelectedUser(null);
    setManualName("");
    setManualPhone("");
    setSearchPhone("");
    setAvailableTables([]);
    setSelectedTableIds([]);
    setFeedback(null);
  };

  const loadReservations = async () => {
    setLoadingReservations(true);
    setReservationError(null);

    const result = await ReservationTableService.getReservationsByDateAndShift(
      selectedDate,
      selectedShift,
      true,
    );

    if (!result.success) {
      setReservationError(result.error || "No se pudieron cargar las reservas.");
      setReservations([]);
      setLoadingReservations(false);
      return [];
    }

    let loaded = result.reservations || [];
    if (statusFilter) {
      loaded = loaded.filter((reservation) => reservation.status === statusFilter);
    }

    const sorted = [...loaded].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.time !== b.time) return a.time.localeCompare(b.time);
      return String(a.userName || "").localeCompare(String(b.userName || ""));
    });

    setReservations(sorted);
    setLoadingReservations(false);
    return sorted;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadReservations();
    resetForm();
  }, [selectedDate, selectedShift, statusFilter]);

  useEffect(() => {
    const loadUsers = async () => {
      const result = await UserService.getAllUsers();
      if (result.success) {
        setUsers(result.users || []);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedReservation) {
      setAvailableTables([]);
      setSelectedTableIds([]);
      return;
    }

    const fetchTables = async () => {
      const result = await ReservationTableService.getAvailableTablesForReservation(
        formState.date || selectedReservation.date,
        formState.time || selectedReservation.time,
        formState.peopleCount || selectedReservation.peopleCount,
        selectedReservation.id,
      );
      if (result.success) {
        setAvailableTables(result.tables || []);
      } else {
        setAvailableTables([]);
      }
    };

    if (formState.date && formState.time && formState.peopleCount > 0) {
      fetchTables();
    }
  }, [selectedReservation, formState.date, formState.time, formState.peopleCount]);

  const selectReservation = (reservation) => {
    const normalized = normalizeReservation(reservation);
    setSelectedReservation(normalized);
    setFormState({
      date: normalized.date,
      time: normalized.time,
      peopleCount: normalized.peopleCount,
      specialRequests: normalized.specialRequests || "",
      status: normalized.status || RESERVATION_STATUS.CONFIRMED,
    });

    if (normalized.userId || normalized.userEmail) {
      setSelectedUser({
        id: normalized.userId || null,
        email: normalized.userEmail || "",
        name: normalized.userName || "",
        phone: normalized.userPhone || "",
      });
      setManualName("");
      setManualPhone("");
    } else {
      setSelectedUser(null);
      setManualName(normalized.userName || "");
      setManualPhone(normalized.userPhone || "");
    }

    setSelectedTableIds(normalized.tableIds || []);
    setFeedback(null);
    setSearchPhone("");
  };

  const refreshSelectedReservation = async (currentReservations) => {
    if (!selectedReservation?.id) {
      return;
    }
    const list = currentReservations || reservations;
    const refreshed = list.find((reservation) => reservation.id === selectedReservation.id);
    if (refreshed) {
      selectReservation(refreshed);
    }
  };

  const handleSaveReservation = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFeedback(null);

    const name = selectedUser ? selectedUser.name || "" : manualName.trim();
    const phone = selectedUser ? selectedUser.phone || "" : manualPhone.trim();

    if (!name || !phone) {
      setFeedback({ type: "error", message: "El nombre y el teléfono son obligatorios." });
      setFormLoading(false);
      return;
    }
    if (!formState.date || !formState.time) {
      setFeedback({ type: "error", message: "Fecha y hora son obligatorias." });
      setFormLoading(false);
      return;
    }

    try {
      if (selectedReservation) {
        const payload = {
          userId: selectedUser?.id || null,
          userEmail: selectedUser?.email || "",
          userName: name,
          userPhone: phone,
          date: formState.date,
          reservationDate: formState.date,
          time: formState.time,
          reservationTime: formState.time,
          peopleCount: Number(formState.peopleCount),
          numberOfPeople: Number(formState.peopleCount),
          specialRequests: formState.specialRequests || "",
          status: formState.status,
        };

        const result = await ReservationTableService.updateReservation(
          selectedReservation.id,
          payload,
        );
        if (result.success) {
          setFeedback({ type: "success", message: "Reserva actualizada correctamente." });
          const updatedReservations = await loadReservations();
          await refreshSelectedReservation(updatedReservations);
        } else {
          setFeedback({ type: "error", message: result.error || "Error actualizando la reserva." });
        }
      } else {
        const result = await ReservationTableService.createReservationFromAdmin({
          user: selectedUser,
          manualName: selectedUser ? undefined : name,
          manualPhone: selectedUser ? undefined : phone,
          date: formState.date,
          time: formState.time,
          peopleCount: Number(formState.peopleCount),
          specialRequests: formState.specialRequests || "",
          adminEmail: adminEmail || "admin@localhost",
        });

        if (result.success) {
          setFeedback({ type: "success", message: "Reserva creada correctamente." });
          resetForm();
          await loadReservations();
        } else {
          setFeedback({ type: "error", message: result.error || "Error creando la reserva." });
        }
      }
    } catch (error) {
      console.error("Error guardando reserva:", error);
      setFeedback({ type: "error", message: error.message || "Error inesperado." });
    } finally {
      setFormLoading(false);
    }
  };

  const handleReservationStatusChange = async (reservationId, nextStatus) => {
    setFeedback(null);
    const result = await ReservationTableService.updateReservation(reservationId, {
      status: nextStatus,
    });
    if (result.success) {
      setFeedback({ type: "success", message: "Estado de reserva actualizado." });
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      setFeedback({ type: "error", message: result.error || "No se pudo actualizar el estado." });
    }
  };

  const handleAssignTables = async () => {
    if (!selectedReservation) {
      return;
    }
    setAssignmentLoading(true);
    setFeedback(null);

    const result = await ReservationTableService.assignTablesToReservation(
      selectedReservation.id,
      selectedTableIds,
    );

    if (result.success) {
      setFeedback({ type: "success", message: "Mesas asignadas correctamente." });
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      setFeedback({ type: "error", message: result.error || "No se pudieron asignar mesas." });
    }
    setAssignmentLoading(false);
  };

  const handleUnassignTables = async () => {
    if (!selectedReservation) {
      return;
    }
    setAssignmentLoading(true);
    setFeedback(null);

    const result = await ReservationTableService.unassignTablesFromReservation(
      selectedReservation.id,
    );

    if (result.success) {
      setFeedback({ type: "success", message: "Mesas desasignadas correctamente." });
      const updatedReservations = await loadReservations();
      await refreshSelectedReservation(updatedReservations);
    } else {
      setFeedback({ type: "error", message: result.error || "No se pudieron desasignar mesas." });
    }
    setAssignmentLoading(false);
  };

  const activeAssignedTableIds = useMemo(() => {
    if (!selectedReservation) return [];
    return Array.isArray(selectedReservation.tableIds)
      ? selectedReservation.tableIds
      : selectedReservation.tableId
      ? [selectedReservation.tableId]
      : [];
  }, [selectedReservation]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-pearl px-4 py-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-dark mb-2">Administración de Reservas</h1>
          <p className="text-stone-gray">Gestiona reservas, actualiza estados y asigna mesas desde una vista unificada.</p>
        </motion.div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Panel 1: Filtros y Listado */}
          <div className="lg:col-span-2 space-y-8">
            {/* Filtros */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-gold rounded-sm p-6 shadow-soft"
            >
              <div className="text-lg font-serif font-bold text-dark mb-4">Filtros</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Fecha"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Turno</label>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gold rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value={RESERVATION_SHIFTS.COMIDA}>Comida</option>
                    <option value={RESERVATION_SHIFTS.CENA}>Cena</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Estado</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gold rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="">Todos</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Listado de Reservas */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-gold rounded-sm p-6 shadow-soft"
            >
              <div className="text-lg font-serif font-bold text-dark mb-4">Listado de Reservas</div>
              
              {loadingReservations ? (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-center text-stone-gray py-8"
                >
                  Cargando reservas...
                </motion.div>
              ) : reservationError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 text-red-700 p-4 rounded-sm"
                >
                  {reservationError}
                </motion.div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gold">
                        <th className="text-left py-3 px-3 font-bold text-dark">Cliente</th>
                        <th className="text-left py-3 px-3 font-bold text-dark">Teléfono</th>
                        <th className="text-left py-3 px-3 font-bold text-dark">Fecha</th>
                        <th className="text-left py-3 px-3 font-bold text-dark">Hora</th>
                        <th className="text-left py-3 px-3 font-bold text-dark">Personas</th>
                        <th className="text-left py-3 px-3 font-bold text-dark">Estado</th>
                        <th className="text-left py-3 px-3 font-bold text-dark">Mesas</th>
                        <th className="text-left py-3 px-3 font-bold text-dark">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation) => {
                        const normalized = normalizeReservation(reservation);
                        return (
                          <motion.tr 
                            key={reservation.id}
                            whileHover={{ backgroundColor: "rgba(198, 167, 94, 0.05)" }}
                            className="border-b border-gold hover:bg-pearl transition-colors"
                          >
                            <td className="py-3 px-3 text-dark">{normalized.userName || "Cliente"}</td>
                            <td className="py-3 px-3 text-dark">{normalized.userPhone || "--"}</td>
                            <td className="py-3 px-3 text-dark">{normalized.date}</td>
                            <td className="py-3 px-3 text-dark">{normalized.time}</td>
                            <td className="py-3 px-3 text-dark">{normalized.peopleCount}</td>
                            <td className="py-3 px-3">
                              <select
                                value={normalized.status}
                                onChange={(e) => handleReservationStatusChange(reservation.id, e.target.value)}
                                className="px-2 py-1 border border-gold rounded-xs text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-3 text-dark text-xs">{normalized.tableIds.length > 0 ? normalized.tableIds.join(", ") : "Sin mesas"}</td>
                            <td className="py-3 px-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => selectReservation(normalized)}
                                className="text-xs px-2 py-1 bg-gold text-dark rounded-xs font-medium hover:bg-gold-light transition-all"
                              >
                                Ver
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                      {reservations.length === 0 && (
                        <tr>
                          <td colSpan="8" className="text-center py-8 text-stone-gray">
                            No hay reservas para este filtro
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          {/* Panel 2: Formulario */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-gold rounded-sm p-6 shadow-soft"
          >
            <div className="text-lg font-serif font-bold text-dark mb-4">
              {selectedReservation ? "Editar Reserva" : "Nueva Reserva"}
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 p-3 rounded-sm text-sm ${
                    feedback.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSaveReservation} className="space-y-3">
              <Input
                label="Buscar cliente"
                type="text"
                value={searchPhone}
                onChange={(e) => {
                  setSearchPhone(e.target.value);
                  if (selectedUser) {
                    setSelectedUser(null);
                    setManualName("");
                    setManualPhone("");
                  }
                }}
                placeholder="Teléfono/nombre/email"
              />

              <AnimatePresence>
                {searchPhone && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border border-gold rounded-sm p-2 bg-pearl max-h-40 overflow-y-auto"
                  >
                    {filteredUsers.length > 0 ? (
                      <div className="space-y-1">
                        {filteredUsers.slice(0, 8).map((user) => (
                          <motion.button
                            key={user.id}
                            whileHover={{ backgroundColor: "rgba(198, 167, 94, 0.1)" }}
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setManualName(user.name || user.displayName || "");
                              setManualPhone(user.phone || "");
                              setSearchPhone("");
                            }}
                            className="w-full text-left text-xs p-2 rounded-xs transition-all"
                          >
                            <strong className="text-dark block">{user.name || user.displayName || user.email}</strong>
                            <span className="text-stone-gray">📱 {user.phone || "Sin teléfono"}</span>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-gray text-center py-2">
                        No se encontraron usuarios
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                label="Nombre"
                type="text"
                value={selectedUser ? selectedUser.name || selectedUser.displayName || "" : manualName}
                onChange={(e) => {
                  setManualName(e.target.value);
                  if (selectedUser) setSelectedUser(null);
                }}
                required
              />

              <Input
                label="Teléfono"
                type="text"
                value={selectedUser ? selectedUser.phone || "" : manualPhone}
                onChange={(e) => {
                  setManualPhone(e.target.value);
                  if (selectedUser) setSelectedUser(null);
                }}
                required
              />

              {selectedUser && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-2 border-gold bg-gold bg-opacity-10 rounded-sm p-3"
                >
                  <div className="text-sm font-bold text-dark mb-1">✓ Cliente seleccionado</div>
                  <div className="text-xs text-stone-gray mb-2">{selectedUser.email}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setManualName("");
                      setManualPhone("");
                    }}
                    className="text-xs text-gold font-medium hover:text-dark transition-colors"
                  >
                    Cambiar cliente
                  </button>
                </motion.div>
              )}

              <Input
                label="Fecha"
                type="date"
                value={formState.date}
                onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Hora</label>
                <select
                  value={formState.time}
                  onChange={(e) => setFormState({ ...formState, time: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gold rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                >
                  <option value="">Selecciona una hora</option>
                  <optgroup label="Comida">
                    {RESERVATION_TIMES.comida.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Cena">
                    {RESERVATION_TIMES.cena.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <Input
                label="Personas"
                type="number"
                min="1"
                value={formState.peopleCount}
                onChange={(e) => setFormState({ ...formState, peopleCount: Number(e.target.value) })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Estado</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gold rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Solicitudes Especiales</label>
                <textarea
                  rows={3}
                  value={formState.specialRequests}
                  onChange={(e) => setFormState({ ...formState, specialRequests: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gold rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={formLoading}
                  className="flex-1"
                >
                  {selectedReservation ? "Guardar" : "Crear"}
                </Button>
                <Button 
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={resetForm}
                  disabled={formLoading}
                  className="flex-1"
                >
                  Limpiar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Panel 3: Asignar Mesas */}
        {selectedReservation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white border-2 border-gold rounded-sm p-6 shadow-soft"
          >
            <div className="text-lg font-serif font-bold text-dark mb-4">Asignar Mesas</div>
            
            <div className="space-y-3 mb-4">
              <div className="text-sm text-dark">
                <strong>Reserva:</strong> {selectedReservation.userName || "Cliente"} — {selectedReservation.date} {selectedReservation.time}
              </div>
              <div className="text-sm text-dark">
                <strong>Mesas asignadas:</strong> {activeAssignedTableIds.length > 0 ? activeAssignedTableIds.join(", ") : "Sin mesas"}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-dark mb-3">Mesas disponibles</div>
              {availableTables.length === 0 ? (
                <div className="text-center text-stone-gray py-6 bg-pearl rounded-sm">
                  No hay mesas disponibles
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                  {availableTables.map((table) => (
                    <motion.label
                      key={table.id}
                      whileHover={{ scale: 1.05 }}
                      className="border-2 border-gold rounded-sm p-3 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTableIds.includes(table.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedTableIds((prev) =>
                            checked
                              ? [...new Set([...prev, table.id])]
                              : prev.filter((id) => id !== table.id),
                          );
                        }}
                        className="mr-2"
                      />
                      <div className="text-sm font-bold text-dark">Mesa {table.number || table.tableNumber || table.id}</div>
                      <div className="text-xs text-stone-gray">Cap: {table.capacity || "-"}</div>
                    </motion.label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAssignTables}
                disabled={assignmentLoading || selectedTableIds.length === 0}
              >
                {assignmentLoading ? "Guardando..." : "Asignar"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUnassignTables}
                disabled={assignmentLoading || activeAssignedTableIds.length === 0}
              >
                Desasignar Todas
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminReservationsView;
