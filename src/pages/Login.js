// Vista: Login.js
// Componente SOLO para login con email y Google
// Diseño responsivo y minimalista

import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import AuthService from "../services/AuthService";
import { Button, Input } from "../components";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next");
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
      navigate(nextPath ? nextPath : "/dashboard", { replace: true });
    } else {
      setError(result.error || "Error al iniciar sesión");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.loginWithGoogle();

      if (result.success) {
        console.log("Google SignIn exitoso", result);

        if (result.requiresPassword) {
          sessionStorage.setItem("googlePasswordSetupPending", "true");
          navigate(
            `/forgot-password?email=${encodeURIComponent(
              result.user.email,
            )}&setup=google`,
            { replace: true },
          );
        } else {
          console.log("Usuario ya tiene perfil completo");
          navigate(nextPath ? nextPath : "/dashboard", { replace: true });
        }
      } else {
        setError(result.error || "Error al iniciar sesión con Google");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-pearl flex items-center justify-center px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-md bg-white border border-gold rounded-xs p-8 shadow-soft">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h1 className="font-serif text-3xl font-bold text-dark mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-stone-gray">
            Accede a tu cuenta en Tsinghe
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-xs"
          >
            <p className="text-xs font-semibold text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="mb-6 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full mt-2"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gold"></div>
          <span className="text-xs text-stone-gray">o</span>
          <div className="flex-1 h-px bg-gold"></div>
        </div>

        {/* Google Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="secondary"
          className="w-full mb-6"
        >
          Continuar con Google
        </Button>

        {/* Links */}
        <motion.div
          className="text-center text-xs text-stone-gray space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.02 }}>
            <Link
              to="/forgot-password"
              className="text-gold hover:text-gold-light font-semibold block transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </motion.div>
          <p>
            ¿No tienes cuenta?{" "}
            <motion.span whileHover={{ scale: 1.02 }}>
              <Link
                to="/register"
                className="text-gold hover:text-gold-light font-semibold transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </motion.span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
