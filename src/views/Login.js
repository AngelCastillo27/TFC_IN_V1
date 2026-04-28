// Vista: Login.js
// Componente SOLO para login con email y Google
// El registro está completamente en Register.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../models/AuthService";
import "../styles/ChineseStyle.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Manejador para el login con email y contraseña
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      console.log("✅ Login exitoso");
      setEmail("");
      setPassword("");
      // El componente se re-renderizará cuando el user se actualice en App.js
    } else {
      setError(result.error || "Error al iniciar sesión");
    }
  };

  // Manejador para Google SignIn
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.loginWithGoogle();
      setLoading(false);

      if (result.success) {
        console.log("✅ Google SignIn exitoso", result);

        // SIEMPRE mostrar modal para crear contraseña después de Google SignIn
        // (así el usuario puede acceder después con email/password)
        setShowPasswordModal(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  // Manejador para agregar contraseña a usuario de Google
  const handleAddPassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setPasswordLoading(true);

    const result = await AuthService.addPasswordToGoogleUser(newPassword);

    if (result.success) {
      console.log("✅ Contraseña agregada exitosamente");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      // El usuario será redirigido automáticamente por App.js
    } else {
      setPasswordError(result.error || "Error al agregar contraseña");
    }

    setPasswordLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Iniciar Sesión</h1>
          <p className="login-subtitle">
            Accede a tu cuenta en Tsinghe Cocina Fusión
          </p>
        </div>

        {/* Mostrar errores */}
        {error && <div className="error-message error-box">❌ {error}</div>}

        {/* Formulario de login */}
        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-login-submit"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Separador */}
        <div className="form-divider">O</div>

        {/* Google SignIn */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn-google btn-full-width"
          title="Inicia sesión con tu cuenta Google"
        >
          🔐 Continuar con Google
        </button>

        {/* Enlaces de ayuda */}
        <div className="login-links">
          <a href="/forgot-password" className="link-button">
            ¿Olvidaste tu contraseña?
          </a>
          <span className="link-separator">•</span>
          <a href="/register" className="link-button">
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </div>

      {/* Modal para agregar contraseña después de Google SignIn */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content password-modal">
            <div className="modal-header">
              <h2>🔐 Crear Contraseña</h2>
              <p>
                Para poder acceder con tu email y contraseña, crea una
                contraseña
              </p>
            </div>

            {passwordError && (
              <div className="error-message error-box">❌ {passwordError}</div>
            )}

            <form onSubmit={handleAddPassword}>
              <div className="form-group">
                <label htmlFor="newPassword">Contraseña</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
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
                disabled={passwordLoading}
                className="btn-primary btn-full-width"
              >
                {passwordLoading ? "Guardando..." : "Crear Contraseña"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError(null);
                }}
                className="btn-secondary btn-full-width"
                style={{ marginTop: "10px" }}
              >
                Omitir (puedes hacerlo después)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
