// Vista: ConfirmReservation.js
// Página para confirmar reservas desde el link en el email

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ConfirmReservation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const confirmReservation = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Token no válido");
        return;
      }

      try {
        // Llamar a Cloud Function para confirmar
        const response = await fetch(
          "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/confirmReservationToken",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setStatus("success");
          setMessage(
            "¡Reserva confirmada exitosamente! Será redirigido en 3 segundos..."
          );
          setEmail(result.email);

          // Verificar si el usuario tiene cuenta
          if (!result.userExists) {
            setShowRegister(true);
            setMessage(
              "¡Reserva confirmada! Ahora crea una cuenta para gestionar tu reserva."
            );
          } else {
            setTimeout(() => {
              navigate("/login");
            }, 3000);
          }
        } else {
          setStatus("error");
          setMessage(result.error || "Error al confirmar la reserva");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error de conexión: " + error.message);
      }
    };

    confirmReservation();
  }, [searchParams, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-pearl flex items-center justify-center px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border-2 border-gold rounded-sm p-10 shadow-soft text-center"
      >
        {/* Loading State */}
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold text-dark">
              Confirmando tu reserva...
            </h2>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, linear: true }}
              className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto"
            />
          </motion.div>
        )}

        {/* Success State */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-3xl font-serif font-bold text-gold mb-4"
            >
              ✅ ¡Reserva Confirmada!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-dark text-sm leading-relaxed"
            >
              {message}
            </motion.p>

            {/* Register CTA */}
            {showRegister && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 bg-pearl p-4 rounded-xs border-l-4 border-gold"
              >
                <p className="text-dark text-sm">
                  Crea una cuenta para poder gestionar tu reserva y acceder a más funciones.
                </p>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={() => navigate(`/register?email=${email}`)}
                  className="w-full px-4 py-2 bg-gold text-dark rounded-xs font-serif font-bold hover:bg-gold-light transition-colors"
                >
                  Crear Cuenta
                </motion.button>
              </motion.div>
            )}

            {/* Login Button */}
            {!showRegister && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                onClick={() => navigate("/login")}
                className="w-full px-4 py-2 bg-gold text-dark rounded-xs font-serif font-bold hover:bg-gold-light transition-colors"
              >
                Ir a Iniciar Sesión
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Error State */}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-3xl font-serif font-bold text-red-600 mb-4"
            >
              ❌ Error al Confirmar
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-dark text-sm leading-relaxed"
            >
              {message}
            </motion.p>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              onClick={() => navigate("/")}
              className="w-full px-4 py-2 bg-gold text-dark rounded-xs font-serif font-bold hover:bg-gold-light transition-colors"
            >
              Volver al Inicio
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ConfirmReservation;
