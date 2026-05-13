// Vista: Home.js
// Página de inicio del restaurante - Diseño responsivo y minimalista
// Paleta: Perla, Dorado, Negro

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { Button } from "../components";

const Home = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-pearl">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-pearl py-12 md:py-20 px-6 border-b border-gold text-center"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold text-dark mb-4"
          >
            Tsinghe Cocina Fusión
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-stone-gray mb-8 max-w-2xl mx-auto"
          >
            Auténtica cocina china en un ambiente acogedor
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => navigate("/menu")}
                variant="primary"
                className="min-w-[160px]"
              >
                Ver Menú
              </Button>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => {
                  const reservePath = "/dashboard?section=nueva-reserva";
                  if (user) {
                    if (role === "admin") {
                      navigate("/reservations");
                    } else {
                      navigate(reservePath);
                    }
                  } else {
                    navigate(`/login?next=${encodeURIComponent(reservePath)}`);
                  }
                }}
                variant="secondary"
                className="min-w-[160px]"
              >
                Reservar Mesa
              </Button>
            </motion.div>
            {!user && (
              <motion.div variants={itemVariants}>
                <Button
                  onClick={() =>
                    navigate(
                      `/login?next=${encodeURIComponent("/dashboard?section=nueva-reserva")}`
                    )
                  }
                  variant="secondary"
                  className="min-w-[160px]"
                >
                  Iniciar Sesión
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Info Sections - Grid Responsivo */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 md:py-16 px-6 bg-white"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Auténtico",
              desc: "Recetas tradicionales chinas preparadas con ingredientes de calidad",
            },
            {
              title: "Acogedor",
              desc: "Ambiente cálido y moderno perfecto para compartir en familia",
            },
            {
              title: "Fácil",
              desc: "Reserva en línea en segundos y gestiona tus preferencias",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="p-6 border border-gold rounded-xs shadow-soft"
            >
              <h3 className="text-lg font-serif font-bold text-dark mb-3">
                ✓ {card.title}
              </h3>
              <p className="text-sm text-stone-gray leading-relaxed">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 md:py-16 px-6 bg-pearl border-t border-gold text-center"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-serif font-bold text-dark mb-12"
          >
            Explora Nuestras Opciones
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "📋",
                title: "Menú Completo",
                desc: "Descubre toda nuestra oferta culinaria",
                action: () => navigate("/menu"),
                label: "Ver Menú",
              },
              {
                icon: "📅",
                title: "Reservar",
                desc: "Asegura tu mesa en el momento que prefieras",
                action: () => {
                  const reservePath = "/dashboard?section=nueva-reserva";
                  if (user) {
                    if (role === "admin") {
                      navigate("/reservations");
                    } else {
                      navigate(reservePath);
                    }
                  } else {
                    navigate(`/login?next=${encodeURIComponent(reservePath)}`);
                  }
                },
                label: "Reservar Ahora",
              },
            ].map((option, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="p-6 bg-white border border-gold rounded-xs shadow-soft"
              >
                <div className="text-3xl mb-3">{option.icon}</div>
                <h3 className="text-xl font-serif font-bold text-dark mb-3">
                  {option.title}
                </h3>
                <p className="text-sm text-stone-gray mb-6 leading-relaxed">
                  {option.desc}
                </p>
                <Button onClick={option.action} variant="secondary" className="w-full">
                  {option.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Final */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-12 md:py-16 px-6 bg-white border-t border-gold text-center"
      >
        <div className="max-w-2xl mx-auto">
          <motion.h2
            variants={itemVariants}
            className="text-2xl md:text-3xl font-serif font-bold text-dark mb-8"
          >
            {user ? `Bienvenido, ${user.email?.split("@")[0]}` : "¿Listo para disfrutar?"}
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap"
          >
            {user ? (
              <>
                <motion.div variants={itemVariants}>
                  <Link to="/dashboard" className="inline-block">
                    <Button variant="primary">
                      Mi Panel
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button onClick={logout} variant="secondary">
                    Cerrar Sesión
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <Link to="/login" className="inline-block">
                    <Button variant="primary">
                      Iniciar Sesión
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link to="/register" className="inline-block">
                    <Button variant="secondary">
                      Registrarse
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-dark text-stone-gray py-6 px-6 text-center text-xs border-t border-gold">
        <p className="m-0">
          © 2026 Tsinghe Cocina Fusión. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Home;

