import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthService from "../services/AuthService";
import { Button, Input } from "../components";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(emailParam),
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido");
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
    if (!formData.phone.trim()) {
      setError("El número de teléfono es obligatorio");
      return false;
    }
    const phoneRegex = /^\+?[0-9\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError("Por favor ingresa un número de teléfono válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await AuthService.registerWithEmail(
        formData.email,
        formData.password,
        formData.name.trim(),
        formData.phone.trim()
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.error || "Error al registrarse");
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
          <h1 className="text-2xl font-serif font-bold text-dark mb-2">Crear Cuenta</h1>
          <p className="text-sm text-stone-gray">Únete a Tsinghe Cocina Fusión</p>
        </motion.div>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-green-50 border border-gold text-dark text-sm rounded-xs text-center"
          >
            ✓ ¡Registro exitoso! Redirigiendo...
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-50 border border-gold text-dark text-sm rounded-xs"
          >
            ⚠ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            type="text"
            name="name"
            placeholder="Ej: Juan García"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            name="confirmPassword"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Número de Teléfono"
            type="tel"
            name="phone"
            placeholder="Ej: +34 600 123 456"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center mt-5 text-xs text-stone-gray"
        >
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-gold font-semibold hover:text-gold-light transition-colors duration-200"
          >
            Inicia sesión
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;