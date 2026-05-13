// Vista: Dashboard.js
// Panel principal tras el login.
// Sidebar dinámico según rol + contenido de cada sección.
// Admin: gestiona menu, mesas, ofertas y reservas.
// Comensal: gestiona sus reservas.

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import ReservationFormComensal from "../components/ReservationFormComensal";
import AdminReservationForm from "../components/AdminReservationForm";
import useDashboard from "../hooks/useDashboard";
import MyReservationsView from "./MyReservationsView";
import AdminReservationsView from "./AdminReservationsView";
import AdminMenu from "./AdminMenu";
import AdminTables from "./AdminTables";
import AdminOffers from "./AdminOffers";
import Home from "./Home";
import Menu from "./Menu";

// Pantalla de bienvenida segun rol
const WelcomePanel = ({ role, userName }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="py-10 px-5 text-center"
  >
    <div className="text-6xl mb-4">
      {role === "admin" ? "🛠️" : "🍽️"}
    </div>
    <h2 className="text-2xl font-serif font-bold text-dark mb-2">
      {role === "admin"
        ? `Panel de Administración`
        : `¡Bienvenido, ${userName || "Usuario"}!`}
    </h2>
    {role !== "admin" && (
      <p className="text-sm text-stone-gray mb-3">
        Tsinghe Cocina Fusión
      </p>
    )}
    <p className="text-stone-gray max-w-md mx-auto leading-relaxed">
      {role === "admin"
        ? "Desde aqui puedes gestionar el menu del restaurante, las mesas, las ofertas y todas las reservas."
        : "Aqui puedes crear, consultar y cancelar tus reservas en Tsinghe Cocina Fusión."}
    </p>

    {/* Tarjetas informativas para admin */}
    {role === "admin" && (
      <div className="flex gap-4 justify-center mt-8 flex-wrap">
        {[
          { emoji: "🍜", label: "Menu", desc: "Platos, precios y alergenos" },
          {
            emoji: "🪑",
            label: "Mesas",
            desc: "Mesas reales con estado en tiempo real",
          },
          { emoji: "🏷️", label: "Ofertas", desc: "Promociones y descuentos" },
          {
            emoji: "📋",
            label: "Reservas",
            desc: "Todas las reservas del restaurante",
          },
        ].map((c) => (
          <motion.div
            key={c.label}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-gold rounded-xs p-6 min-w-[140px] text-center shadow-soft"
          >
            <div className="text-3xl">{c.emoji}</div>
            <div className="font-bold text-dark mt-2">
              {c.label}
            </div>
            <div className="text-xs text-stone-gray mt-1">
              {c.desc}
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
);

// Render del contenido segun opcion del sidebar
const renderContent = (selectedOption, role, userId, userName, userEmail) => {
  switch (selectedOption) {
    case "inicio":
      return <WelcomePanel role={role} userName={userName} />;

    case "preview-inicio":
      return <Home />;

    case "preview-menu":
      return <Menu />;

    // Comensal
    case "reservas":
      return <MyReservationsView userId={userId} />;

    case "nueva-reserva":
      return <ReservationFormComensal />;

    // Admin
    case "admin-menu":
      return <AdminMenu />;
    case "admin-mesas":
      return <AdminTables userId={userId} userRole={role} />;
    case "admin-ofertas":
      return <AdminOffers />;
    case "admin-reservas":
      return <AdminReservationsView />;
    case "admin-crear-reserva":
      return (
        <AdminReservationForm
          onReservationCreated={() => {
            // Podría hacer algo aquí si quiere
          }}
        />
      );

    default:
      return (
        <div className="py-10 px-5 text-center text-stone-gray">
          Seccion no encontrada.
        </div>
      );
  }
};

// Iconos para el sidebar
const ICONS = {
  inicio: "🏠",
  reservas: "📅",
  "admin-menu": "🍜",
  "admin-mesas": "🪑",
  "admin-ofertas": "🏷️",
  "admin-reservas": "📋",
};

void ICONS;

const Dashboard = ({ role, userId, userName, userEmail, logout }) => {
  const { selectedOption, availableOptions, selectOption } = useDashboard(role);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section === "nueva-reserva") {
      const isAvailable = availableOptions.some((opt) => opt.id === "nueva-reserva");
      if (isAvailable) {
        selectOption("nueva-reserva");
        params.delete("section");
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      }
    }
  }, [location.pathname, location.search, availableOptions, selectOption, navigate]);

  // Proteger acceso si el usuario tiene cambio de contrasena pendiente (Google)
  useEffect(() => {
    const hasPasswordPending = sessionStorage.getItem(
      "googlePasswordSetupPending",
    );
    if (hasPasswordPending) {
      // Obtener el email del usuario actual
      const email = userEmail || "";
      navigate(
        `/forgot-password?email=${encodeURIComponent(email)}&setup=google`,
        { replace: true },
      );
    }
  }, [navigate, userEmail]);

  return (
    <div className="flex min-h-screen bg-pearl">
      {/* Sidebar Component */}
      <Sidebar
        role={role}
        userName={userName}
        selectedOption={selectedOption}
        onSelectOption={selectOption}
        onLogout={logout}
      />

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <main className="flex-1 bg-pearl overflow-y-auto">
        {renderContent(selectedOption, role, userId, userName, userEmail)}
      </main>
    </div>
  );
};

export default Dashboard;
