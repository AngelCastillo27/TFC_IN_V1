// Vista: Register.js
// Componente de registro de nuevos usuarios
// Incluye validación de formulario y manejo de errores

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthService from "../models/AuthService";
import "../styles/ChineseStyle.css";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error al escribir
    if (error) setError(null);
  };

  // Validar el formulario
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    if (!formData.email.trim()) {
      setError("El email es requerido");
      return false;
    }
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+\$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return false;
    }
    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Llamar al servicio de registro
      const result = await AuthService.registerWithEmail(
        formData.email,
        formData.password,
        formData.name.trim()
      );

      setLoading(false);

      if (result.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        
        // Mostrar mensaje de éxito y redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.error || "Error al registrarse. Por favor intenta de nuevo");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Error inesperado durante el registro");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>?? Registrarse</h1>
          <p className="register-subtitle">Crea tu cuenta en Dragon Palace</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-message error-box">
            ? {error}
          </div>
        )}

        {/* Mensaje de éxito */}
        {success && (
          <div className="success-message success-box">
            ? ¡Registro exitoso! Redirigiendo al login...
          </div>
        )}

        {/* Formulario de registro */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* Campo Nombre */}
          <div className="form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Ej: Juan García"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Ej: tu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <small className="form-hint">Mínimo 6 caracteres</small>
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary btn-register-submit"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        {/* Link al login */}
        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="link-button"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>

        {/* Información adicional */}
        <div className="register-info">
          <p className="info-text">
            Al registrarte, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
