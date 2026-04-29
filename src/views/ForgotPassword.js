// Vista: ForgotPassword.js
// Recuperacion de contrasena con token.
// Tambien se usa para obligar a usuarios Google a crear contrasena local.

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthService from "../models/AuthService";
import "../styles/ChineseStyle.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const isGoogleSetup = searchParams.get("setup") === "google";

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(isGoogleSetup ? 2 : 1);

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const requestToken = async (emailValue) => {
    setLoading(true);

    try {
      await AuthService.requestPasswordReset(emailValue);
      setStep(2);
      setError("Token enviado. Revisa tu email y crea tu contrasena.");
    } catch (err) {
      setStep(2);
      setError("Token enviado. Revisa tu email y crea tu contrasena.");
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
      setError("Por favor ingresa un email valido");
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

    if (!newPassword) {
      setError("Ingresa una nueva contrasena");
      return;
    }

    if (newPassword.length < 4) {
      setError("La contrasena debe tener al menos 4 caracteres");
      return;
    }

    if (!confirmPassword) {
      setError("Confirma tu nueva contrasena");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const result = isGoogleSetup
        ? await AuthService.addPasswordToGoogleUser(newPassword)
        : await AuthService.resetPasswordWithToken(email, token, newPassword);

      if (result.success) {
        sessionStorage.removeItem("googlePasswordSetupPending");
        setError("Contrasena actualizada exitosamente");

        setTimeout(() => {
          navigate(isGoogleSetup ? "/dashboard" : "/login");
        }, 2000);
      } else {
        setError(result.error || "Error al resetear la contrasena");
      }
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const isSuccessMessage =
    error &&
    (error.includes("Token enviado") ||
      error.includes("actualizada exitosamente"));

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>{isGoogleSetup ? "Crear Contrasena" : "Recuperar Contrasena"}</h1>
          <p className="forgot-password-subtitle">
            {isGoogleSetup
              ? "Crea una contrasena para poder acceder tambien con email"
              : step === 1
              ? "Ingresa tu email para recibir un token"
              : "Ingresa el token y tu nueva contrasena"}
          </p>
        </div>

        {error && (
          <div
            className={
              isSuccessMessage
                ? "success-message success-box"
                : "error-message error-box"
            }
          >
            {error}
          </div>
        )}

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

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="emailReadonly">Email</label>
              <input
                id="emailReadonly"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isGoogleSetup}
                required
              />
            </div>

            {!isGoogleSetup && (
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
            )}

            <div className="form-group">
              <label htmlFor="newPassword">Nueva Contrasena</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Minimo 4 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contrasena</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contrasena"
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
              {loading ? "Actualizando..." : "Actualizar Contrasena"}
            </button>

            {!isGoogleSetup && (
              <button
                type="button"
                onClick={handleBackToStep1}
                className="btn-secondary btn-full-width"
              >
                Volver
              </button>
            )}
          </form>
        )}

        <div className="forgot-password-links">
          <a href="/login" className="link-button">
            Volver al Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
