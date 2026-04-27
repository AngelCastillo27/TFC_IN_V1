// Vista: ForgotPassword.js
// Componente para recuperación de contraseña con token
// Paso 1: Solicitar token al email
// Paso 2: Ingresar token y nueva contraseña

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../models/AuthService";
import "../styles/ChineseStyle.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Pedir email, 2: Pedir token y contraseña

  // Validar email
  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  // Paso 1: Solicitar token
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

    setLoading(true);

    try {
      const result = await AuthService.requestPasswordReset(email);
      setLoading(false);

      if (result.success) {
        setSuccess(true);
        setStep(2); // Avanzar al paso 2
      } else {
        setError(result.error || "Error al solicitar el reset");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Error inesperado");
    }
  };

  // Paso 2: Validar token y resetear contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Ingresa el token recibido en tu email");
      return;
    }

    if (token.length !== 3) {
      setError("El token debe tener exactamente 3 caracteres");
      return;
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
      const result = await AuthService.resetPasswordWithToken(
        email,
        token,
        newPassword
      );
      setLoading(false);

      if (result.success) {
        setSuccess(true);
        setError("✅ Contraseña actualizada exitosamente");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.error || "Error al resetear la contraseña");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Error inesperado");
    }
  };

  // Volver al paso anterior
  const handleBackToStep1 = () => {
    setStep(1);
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>🔐 Recuperar Contraseña</h1>
          <p className="forgot-password-subtitle">
            {step === 1
              ? "Ingresa tu email para recibir un token"
              : "Ingresa el token y tu nueva contraseña"}
          </p>
        </div>

        {error && (
          <div
            className={
              error.includes("✅") ? "success-message success-box" : "error-message error-box"
            }
          >
            {error}
          </div>
        )}

        {/* PASO 1: Solicitar Token */}
        {step === 1 && (
          <form onSubmit={handleRequestToken} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-full-width"
            >
              {loading ? "Enviando..." : "Enviar Token"}
            </button>
          </form>
        )}

        {/* PASO 2: Ingresar Token y Nueva Contraseña */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="token">Token (3 caracteres)</label>
              <input
                id="token"
                type="text"
                placeholder="Ej: ABC"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                maxLength="3"
                required
              />
              <small className="form-hint">
                Verifica tu email y copia el token recibido
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-full-width"
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>

            <button
              type="button"
              onClick={handleBackToStep1}
              className="btn-secondary btn-full-width"
            >
              Volver
            </button>
          </form>
        )}

        {/* Link al login */}
        <div className="forgot-password-links">
          <a href="/login" className="link-button">
            ← Volver al Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
