// Vista: ForgotPassword.js
// Recuperación de contraseña con token
// También se usa para usuarios Google que crean contraseña local

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "../services/AuthService";
import { Button, Input } from "../components";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const isGoogleSetup = searchParams.get("setup") === "google";

  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(isGoogleSetup ? 2 : 1);
  const [message, setMessage] = useState("");

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const requestToken = async (emailValue) => {
    setLoading(true);
    try {
      await AuthService.requestPasswordReset(emailValue);
      setStep(2);
      setMessage("Token enviado a tu email");
    } catch (err) {
      setStep(2);
      setMessage("Token enviado a tu email");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGoogleSetup) return;
    const currentUser = AuthService.getCurrentUser();
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [isGoogleSetup]);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Por favor ingresa tu email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    await requestToken(email);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isGoogleSetup && !token.trim()) {
      setError("Ingresa el token recibido en tu email");
      return;
    }

    if (!isGoogleSetup && token.length !== 3) {
      setError("El token debe tener exactamente 3 caracteres");
      return;
    }

    if (isGoogleSetup) {
      if (!phone.trim()) {
        setError("El número de teléfono es obligatorio");
        return;
      }
      const phoneRegex = /^\+?[0-9\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        setError("Por favor ingresa un número de teléfono válido");
        return;
      }
    }

    if (!newPassword) {
      setError("Ingresa una nueva contraseña");
      return;
    }

    if (newPassword.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    if (!confirmPassword) {
      setError("Confirma tu nueva contraseña");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const result = isGoogleSetup
        ? await AuthService.completeProfile(phone.trim(), newPassword)
        : await AuthService.resetPasswordWithToken(email, token, newPassword);

      if (result.success) {
        sessionStorage.removeItem("googlePasswordSetupPending");
        setMessage("Contraseña actualizada exitosamente");
        setTimeout(() => {
          navigate(isGoogleSetup ? "/dashboard" : "/login");
        }, 2000);
      } else {
        setError(result.error || "Error al resetear la contraseña");
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-pearl flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-md bg-white border border-gold rounded-xs p-8 shadow-soft">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-7 text-center"
        >
          <h1 className="text-2xl font-serif font-bold text-dark mb-2">
            {isGoogleSetup ? "Completar Registro" : "Recuperar Contraseña"}
          </h1>
          <p className="text-xs text-stone-gray">
            {isGoogleSetup
              ? "Proporciona tu número de teléfono y crea una contraseña"
              : step === 1
              ? "Ingresa tu email para recibir un token"
              : "Ingresa el token y tu nueva contraseña"}
          </p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-green-50 border border-gold text-dark text-xs rounded-xs text-center"
          >
            ✓ {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-50 border border-gold text-dark text-xs rounded-xs"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleRequestToken}
              className="space-y-4 mb-5"
            >
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Token"}
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleResetPassword}
              className="space-y-4 mb-5"
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isGoogleSetup}
                required
              />

              {isGoogleSetup && (
                <Input
                  label="Número de Teléfono"
                  type="tel"
                  placeholder="Ej: +34 600 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              )}

              {!isGoogleSetup && (
                <div>
                  <Input
                    label="Token (3 caracteres)"
                    type="text"
                    placeholder="Ej: ABC"
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    maxLength="3"
                    required
                  />
                  <p className="text-xs text-stone-gray mt-2">
                    Verifica tu email y copia el token
                  </p>
                </div>
              )}

              <Input
                label="Nueva Contraseña"
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirmar Contraseña"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center text-xs text-stone-gray"
        >
          {step === 1 ? (
            <>
              ¿Recuerdas tu contraseña?{" "}
              <Link
                to="/login"
                className="text-gold font-semibold hover:text-gold-light transition-colors duration-200"
              >
                Inicia sesión
              </Link>
            </>
          ) : (
            <>
              ¿Necesitas un nuevo token?{" "}
              <button
                onClick={() => {
                  setStep(1);
                  setToken("");
                  setPhone("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError(null);
                  setMessage("");
                }}
                className="bg-none border-none text-gold font-semibold underline cursor-pointer hover:text-gold-light transition-colors duration-200"
              >
                Volver
              </button>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
