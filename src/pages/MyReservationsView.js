import React from "react";
import { motion } from "framer-motion";
import useReservations from "../hooks/useReservations";

const MyReservationsView = ({ userId }) => {
  const { reservations, loading, error } = useReservations(userId);

  if (loading) {
    return (
      <div className="py-6 px-6 text-center text-stone-gray">
        Cargando tus reservas...
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const getStatusColor = (status) => {
    return status === "confirmada"
      ? "bg-green-50 border-green-300 text-green-700"
      : "bg-yellow-50 border-yellow-300 text-yellow-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="py-6 px-6 max-w-4xl mx-auto"
    >
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-serif font-bold text-dark mb-6"
      >
        📌 Mis Reservas
      </motion.h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-xs text-sm"
        >
          {error}
        </motion.div>
      )}

      {reservations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 bg-pearl border border-gold rounded-xs text-center text-stone-gray"
        >
          Aún no tienes reservas. Puedes crear una nueva desde la opción "Nueva Reserva".
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {reservations
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            .map((reservation) => {
              const assignedTables = Array.isArray(reservation.tableIds)
                ? reservation.tableIds
                : reservation.tableId
                ? [reservation.tableId]
                : [];

              return (
                <motion.div
                  key={reservation.id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-gold rounded-xs p-6 shadow-soft hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-lg font-serif font-bold text-dark">
                      Reserva {reservation.id.slice(-6).toUpperCase()}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-stone-gray">
                    <p>
                      <strong className="text-dark">📅 Fecha:</strong> {reservation.date || reservation.reservationDate}
                    </p>
                    <p>
                      <strong className="text-dark">🕐 Hora:</strong> {reservation.time || reservation.reservationTime}
                    </p>
                    <p>
                      <strong className="text-dark">👥 Personas:</strong> {reservation.peopleCount || reservation.numberOfPeople}
                    </p>
                    <p>
                      <strong className="text-dark">🪑 Mesas:</strong>{" "}
                      {assignedTables.length > 0 ? assignedTables.join(", ") : "Pendiente"}
                    </p>
                    {reservation.specialRequests && (
                      <p>
                        <strong className="text-dark">📝 Solicitudes:</strong> {reservation.specialRequests}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyReservationsView;
