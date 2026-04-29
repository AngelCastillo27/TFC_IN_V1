// Vista: Login.js
// Componente SOLO para login con email y Google
// El registro esta completamente en Register.js

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      console.log("Login exitoso");
      setEmail("");
      setPassword("");
    } else {
      setError(result.error || "Error al iniciar sesion");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    sessionStorage.setItem("googlePasswordSetupPending", "true");

    try {
      const result = await AuthService.loginWithGoogle();

      if (result.success) {
        console.log("Google SignIn exitoso", result);
        navigate(
          `/forgot-password?email=${encodeURIComponent(
            result.user.email,
          )}&setup=google`,
          { replace: true },
        );
      } else {
        sessionStorage.removeItem("googlePasswordSetupPending");
        setError(result.error || "Error al iniciar sesion con Google");
      }
    } catch (err) {
      sessionStorage.removeItem("googlePasswordSetupPending");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesion</h1>
          <p className="login-subtitle">
            Accede a tu cuenta en Tsinghe Cocina Fusion
          </p>
        </div>

        {error && <div className="error-message error-box">{error}</div>}

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
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Tu contrasena"
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
            {loading ? "Iniciando..." : "Iniciar Sesion"}
          </button>
        </form>

        <div className="form-divider">O</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn-google btn-full-width"
          title="Inicia sesion con tu cuenta Google"
        >
          Continuar con Google
        </button>

        <div className="login-links">
          <a href="/forgot-password" className="link-button">
            Olvidaste tu contrasena?
          </a>
          <span className="link-separator">-</span>
          <a href="/register" className="link-button">
            No tienes cuenta? Registrate
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
