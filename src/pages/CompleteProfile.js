// Vista: CompleteProfile.js
// Pantalla para completar datos faltantes después de login con Google
// Pide teléfono obligatorio y contraseña opcional

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "../services/AuthService";
import { Input, Button, Container } from "../components";
import "../styles/MinimalStyle.css";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);

  useEffect(() => {
    const checkUserData = async () => {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userDoc = await AuthService.getUserDoc(currentUser.uid);
        if (userDoc && userDoc.phone) {
          // Ya tiene teléfono, redirigir
          navigate("/dashboard");
          return;
        }
        setRequiresPassword(!userDoc?.passwordConfigured);
      } catch (err) {
        console.error("Error checking user data:", err);
      }
    };

    checkUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.phone.trim()) {
      setError("El número de teléfono es obligatorio");
      return false;
    }
    const phoneRegex = /^\+?[0-9\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError("Por favor ingresa un número de teléfono válido");
      return false;
    }

    if (requiresPassword) {
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
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await AuthService.completeProfile(
        formData.phone.trim(),
        requiresPassword ? formData.password : null
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError(result.error || "Error al completar el perfil");
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
      className="min-h-[calc(100vh-60px)] bg-pearl flex items-center justify-center px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border-2 border-gold rounded-sm p-10 shadow-soft"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-serif font-bold text-dark mb-2">
            Completar Perfil
          </h1>
          <p className="text-sm text-stone-gray">
            Necesitamos algunos datos adicionales para continuar
          </p>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-green-50 border-2 border-green-400 text-green-700 rounded-xs text-sm font-medium text-center"
            >
              ✓ ¡Perfil completado! Redirigiendo...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-50 border-2 border-red-400 text-red-700 rounded-xs text-sm font-medium"
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Phone Input */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-dark mb-2">
              Número de Teléfono *
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Ej: +34 600 123 456"
            />
          </motion.div>

          {/* Password Fields (Conditional) */}
          <AnimatePresence mode="wait">
            {requiresPassword && (
              <motion.div
                key="password-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-sm font-medium text-dark mb-2">
                    Contraseña *
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Mínimo 6 caracteres"
                  />
                </motion.div>

                {/* Confirm Password Input */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-dark mb-2">
                    Confirmar Contraseña *
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Repetir contraseña"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="pt-2"
          >
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { y: -1 } : {}}
              whileTap={!loading ? { y: 0 } : {}}
              className="w-full px-4 py-3 bg-gold text-dark rounded-xs font-serif font-bold text-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Completar Perfil"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default CompleteProfile;