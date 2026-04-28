// Vista: Register.js
// Componente de registro de nuevos usuarios
// Incluye validaci�n de formulario y manejo de errores

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import AuthService from "../models/AuthService";
import "../styles/ChineseStyle.css";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Pre-llenar email desde URL (?email=xxx)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(emailParam),
      }));
    }
  }, [searchParams]);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return false;
    }
    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (formData.password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return false;
    }
    if (!formData.confirmPassword) {
      setError("Debes confirmar tu contraseña");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  // Manejar env�o del formulario
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
        formData.name.trim(),
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

        // Mostrar mensaje de �xito y redirigir despu�s de 2 segundos
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Manejar sugerencia de login si el email ya existe
        if (result.suggestion === "login") {
          setError(
            <>
              {result.error}{" "}
              <a href="/login" style={{ color: "white", textDecoration: "underline" }}>
                Ir a Login
              </a>
            </>
          );
        } else {
          setError(result.error || "Error al registrarse. Por favor intenta de nuevo");
        }
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
          <p className="register-subtitle">
            Crea tu cuenta en Tsinghe Cocina Fusión
          </p>
        </div>

        {/* Mensaje de error */}
        {error && <div className="error-message error-box">? {error}</div>}

        {/* Mensaje de �xito */}
        {success && (
          <div className="success-message success-box">
            ? �Registro exitoso! Redirigiendo al login...
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
              placeholder="Ej: Juan Garc�a"
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

          {/* Campo Contrase�a */}
          <div className="form-group">
            <label htmlFor="password">Contrase�a</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="M�nimo 6 caracteres"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <small className="form-hint">M�nimo 6 caracteres</small>
          </div>

          {/* Campo Confirmar Contrase�a */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contrase�a</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Repite tu contrase�a"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Bot�n de env�o */}
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
            �Ya tienes cuenta?{" "}
            <button onClick={() => navigate("/login")} className="link-button">
              Inicia sesi�n aqu�
            </button>
          </p>
        </div>

        {/* Informaci�n adicional */}
        <div className="register-info">
          <p className="info-text">
            Al registrarte, aceptas nuestros t�rminos de servicio y pol�tica de
            privacidad
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
