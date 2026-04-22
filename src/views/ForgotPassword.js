// Vista: ForgotPassword.js
// Componente para recuperación de contraseña
// Envía email con link de reset usando Firebase Auth

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import "../styles/ChineseStyle.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validar email
  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+\$/;
    return emailRegex.test(emailValue);
  };

  // Manejar cambios en el input
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar email
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
      // Enviar email de reset de contraseña
      await sendPasswordResetEmail(auth, email);
      
      setSuccess(true);
      setSubmitted(true);
      setEmail("");
      
      // Mostrar el mensaje de éxito durante 5 segundos antes de redirigir
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (err) {
      setLoading(false);
      
      // Manejar diferentes tipos de errores
      if (err.code === "auth/user-not-found") {
        setError("No se encontró una cuenta con este email");
      } else if (err.code === "auth/invalid-email") {
        setError("El email no es válido");
      } else if (err.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Por favor intenta más tarde");
      } else {
        setError("Error al enviar el email. Por favor intenta de nuevo");
      }
    }
  };

  // Redirigir al login
  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>?? Recuperar Contraseña</h1>
          <p className="forgot-password-subtitle">
            Te ayudaremos a recuperar acceso a tu cuenta
          </p>
        </div>

        {success && submitted ? (
          <div className="success-section">
            <div className="success-icon">?</div>
            <h2>¡Email enviado!</h2>
            <p className="success-message">
              Hemos enviado un email a <strong>{email}</strong> con instrucciones 
              para recuperar tu contraseña.
            </p>
            <div className="success-steps">
              <p className="step-title">Próximos pasos:</p>
              <ol>
                <li>Revisa tu email (también la carpeta de spam)</li>
                <li>Haz clic en el enlace de recuperación</li>
                <li>Crea una nueva contraseña</li>
                <li>Inicia sesión con tu nueva contraseña</li>
              </ol>
            </div>
            <p className="redirect-message">
              Serás redirigido al login en unos segundos...
            </p>
            <button 
              onClick={handleBackToLogin}
              className="btn-primary"
            >
              Volver al Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            {/* Mensaje de error */}
            {error && (
              <div className="error-message error-box">
                ? {error}
              </div>
            )}

            {/* Campo de email */}
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <p className="field-description">
                Ingresa el email asociado a tu cuenta
              </p>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                required
              />
            </div>

            {/* Botones */}
            <div className="form-buttons">
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary btn-submit"
              >
                {loading ? "Enviando..." : "Enviar Email de Recuperación"}
              </button>
              <button 
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="btn-secondary btn-back"
              >
                Volver al Login
              </button>
            </div>
          </form>
        )}

        {/* Información adicional */}
        {!submitted && (
          <div className="forgot-password-info">
            <h3>¿Necesitas ayuda?</h3>
            <ul>
              <li>Si no recibes el email, revisa tu carpeta de spam</li>
              <li>El enlace de recuperación es válido por 1 hora</li>
              <li>Si tienes problemas, contacta con nuestro soporte</li>
            </ul>
            <p className="support-contact">
              ?? Soporte: info@dragonpalace.es
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
