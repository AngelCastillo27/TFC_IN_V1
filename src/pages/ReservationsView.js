import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useReservations from "../hooks/useReservations";
import useTables from "../hooks/useTables";
import { Button } from "../components";

const ReservationsView = ({ role, userId }) => {
  const navigate = useNavigate();
  const { reservations, loading, updateReservation, deleteReservation } =
    useReservations(role === "comensal" ? userId : null);
  const { tables } = useTables();

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ numPeople: 1 });

  const handleEditSave = async (id) => {
    await updateReservation(id, {
      numberOfPeople: parseInt(editData.numPeople),
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-pearl flex items-center justify-center"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-lg text-stone-gray"
        >
          Cargando reservas...
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-pearl px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-serif font-bold text-dark mb-8 pb-4 border-b-2 border-gold"
        >
          📋 Mis Reservas
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {reservations.map((res, idx) => {
            const reservationTableIds = Array.isArray(res.tableIds)
              ? res.tableIds
              : [];
            const assignedTables = tables
              .filter(
                (table) =>
                  reservationTableIds.includes(table.id) ||
                  table.reservationId === res.id ||
                  table.id === res.tableId,
              )
              .sort(
                (a, b) =>
                  Number(a.tableNumber || a.number || 0) -
                  Number(b.tableNumber || b.number || 0),
              );
            const fusionCode =
              res.fusionCode ||
              assignedTables.find((table) => table.fusionCode)?.fusionCode;
            const tableNumbers = assignedTables.map(
              (table) => table.tableNumber || table.number || table.id,
            );
            const tableDisplay =
              tableNumbers.length > 1
                ? `${fusionCode ? `${fusionCode}: ` : ""}Mesas ${tableNumbers.join(", ")}`
                : tableNumbers.length === 1
                  ? `Mesa ${tableNumbers[0]}`
                  : "Pendiente";

            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                className="bg-white border-2 border-gold rounded-sm p-6 shadow-soft"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información de Reserva */}
                  <div className="space-y-3">
                    <h4 className="text-xl font-serif font-bold text-dark">
                      👤 {res.userName || "Cliente"}
                    </h4>
                    
                    <div className="text-sm text-dark space-y-1">
                      <p><strong>📅 Fecha:</strong> {res.reservationDate}</p>
                      <p><strong>⌚ Hora:</strong> {res.reservationTime}</p>
                      
                      {editingId === res.id ? (
                        <div className="flex gap-2">
                          <label className="text-sm font-medium">Personas:</label>
                          <input
                            type="number"
                            value={editData.numPeople}
                            onChange={(e) =>
                              setEditData({ ...editData, numPeople: e.target.value })
                            }
                            className="w-16 px-2 py-1 border-2 border-gold rounded-xs text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                        </div>
                      ) : (
                        <p><strong>👥 Personas:</strong> {res.numberOfPeople}</p>
                      )}
                      
                      <p><strong>🪑 Mesa:</strong> {tableDisplay}</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() =>
                        navigate("/admin/tables", {
                          state: {
                            pendingAssignment: {
                              resId: res.id,
                              numberOfPeople: res.numberOfPeople,
                              userName: res.userName,
                            },
                          },
                        })
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-xs font-medium hover:bg-blue-700 transition-all text-sm"
                    >
                      🧩 Asignar Mesas
                    </motion.button>

                    {editingId === res.id ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEditSave(res.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-xs font-medium hover:bg-green-700 transition-all text-sm"
                      >
                        💾 Guardar
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setEditingId(res.id);
                          setEditData({ numPeople: res.numberOfPeople });
                        }}
                        className="px-4 py-2 bg-gold text-dark rounded-xs font-medium hover:bg-gold-light transition-all text-sm"
                      >
                        ✏️ Editar Cantidad
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        updateReservation(res.id, { status: "confirmada" })
                      }
                      className="px-4 py-2 bg-green-50 border-2 border-green-400 text-green-700 rounded-xs font-medium hover:bg-green-100 transition-all text-sm"
                    >
                      ✅ Confirmar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => deleteReservation(res.id)}
                      className="px-4 py-2 text-stone-gray hover:text-red-600 text-sm transition-colors"
                    >
                      🗑️ Eliminar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

const resCard = {
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  background: "#fff",
};
const actionButtonsGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: "200px",
};
const btnBlue = {
  background: "#007bff",
  color: "white",
  border: "none",
  padding: "10px",
  cursor: "pointer",
  borderRadius: "6px",
  fontWeight: "bold",
};
const btnGreen = {
  background: "#28a745",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "6px",
};
const btnYellow = {
  background: "#FFD700",
  border: "none",
  padding: "10px",
  borderRadius: "6px",
  fontWeight: "bold",
};
const btnConfirm = {
  background: "#f9f9f9",
  border: "1px solid #28a745",
  color: "#28a745",
  padding: "8px",
  borderRadius: "6px",
};
const btnDelete = {
  background: "transparent",
  color: "#999",
  border: "none",
  fontSize: "12px",
  cursor: "pointer",
};

export default ReservationsView;
