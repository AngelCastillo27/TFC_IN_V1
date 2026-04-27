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
        console.log("✅ Google SignIn exitoso");
        // El componente se re-renderizará cuando el user se actualice en App.js
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
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
    </div>
  );
};

export default Login;
