// Vista: Login.js
// Este componente representa la vista del formulario de login y registro.
// Maneja la entrada del usuario y llama al controlador useAuth.

import React, { useState } from "react";
import AuthService from "../models/AuthService";
import "../styles/ChineseStyle.css";

const Login = () => {
  // Estados locales para el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Manejador para el envío del formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await AuthService.loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      console.log("Login exitoso");
      setEmail("");
      setPassword("");
      // El componente se re-renderizará cuando el user se actualice en App.js
    } else {
      setError(result.error);
    }
  };

  // Manejador para el registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.registerWithEmail(email, password);
      setLoading(false);

      if (result.success) {
        console.log("Registro exitoso");
        setIsRegistering(false);
        setEmail("");
        setPassword("");
        setError("Usuario registrado. Por favor, inicia sesión.");
        // Enviar email de bienvenida
        await AuthService.sendWelcomeEmail(email, email.split("@")[0]);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
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
        console.log("Google SignIn exitoso");
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
      <h2>{isRegistering ? "Registro" : "Iniciar Sesión"}</h2>

      <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? "Cargando..."
            : isRegistering
              ? "Registrarse"
              : "Iniciar Sesión"}
        </button>
      </form>

      {/* Botón de Google */}
      {!isRegistering && (
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn-google"
        >
          🔐 Inicia sesión con Google
        </button>
      )}

      <button
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError(null);
          setEmail("");
          setPassword("");
        }}
        className="btn-secondary"
      >
        {isRegistering
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿No tienes cuenta? Regístrate"}
      </button>

      {error && (
        <div
          className={
            error.includes("Por favor") ? "success-message" : "error-message"
          }
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default Login;
