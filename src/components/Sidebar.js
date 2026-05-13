// Componente: Sidebar.js
// Sidebar desplegable/plegable para comensal y admin.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ role, userName, selectedOption, onSelectOption, onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const menuOptions =
    role === "admin"
      ? [
          { id: "inicio", label: "Panel Principal", icon: "🏠" },
          { id: "preview-inicio", label: "Ver Inicio", icon: "👁️" },
          { id: "preview-menu", label: "Ver Menu", icon: "📖" },
          { id: "admin-menu", label: "Gestionar Menu", icon: "🍜" },
          { id: "admin-mesas", label: "Gestionar Mesas", icon: "🪑" },
          { id: "admin-ofertas", label: "Ofertas", icon: "🏷️" },
          { id: "admin-reservas", label: "Todas las Reservas", icon: "📋" },
        ]
      : [
          { id: "inicio", label: "Dashboard", icon: "📊" },
          { id: "preview-inicio", label: "Ver Inicio", icon: "👁️" },
          { id: "preview-menu", label: "Ver Menú", icon: "📖" },
          { id: "reservas", label: "Mis Reservas", icon: "📅" },
          { id: "nueva-reserva", label: "Nueva Reserva", icon: "➕" },
        ];

  const handleLogout = async () => {
    await onLogout();
    navigate("/login");
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Ocultar menu" : "Mostrar menu"}
        className="fixed left-0 top-20 z-50 bg-dark text-gold p-2 rounded-r-xs font-bold hover:bg-gold hover:text-dark transition-colors duration-200"
      >
        {isOpen ? "X" : "≡"}
      </motion.button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -220, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -220, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 w-55 h-screen bg-dark border-r border-gold z-40 pt-20 flex flex-col overflow-hidden"
          >
            <div className="px-5 pb-5 border-b border-gold">
              <div className="text-xs text-stone-gray uppercase tracking-widest">
                {" ----> "} ROL
              </div>
              <div className="text-gold font-bold mt-1 text-sm">
                {role === "admin" ? "--->Administrador" : "--->Comensal"}
              </div>
              {userName && (
                <div className="text-stone-gray text-xs mt-2 italic">
                  {userName}
                </div>
              )}
            </div>

            <nav className="flex-1 py-4">
              <ul className="space-y-1 m-0 p-0">
                {menuOptions.map((option) => {
                  const isActive = selectedOption === option.id;
                  return (
                    <motion.li key={option.id}>
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => onSelectOption(option.id)}
                        className={`w-full py-3 px-5 text-left text-sm font-medium flex items-center gap-3 transition-all duration-200 ${
                          isActive
                            ? "bg-gold text-dark border-l-4 border-dark font-bold"
                            : "text-stone-gray hover:bg-gray-800 border-l-4 border-transparent"
                        }`}
                      >
                        <span className="text-base">{option.icon}</span>
                        {option.label}
                      </motion.button>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-gold">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full bg-transparent text-gold border border-gold rounded-xs py-2 px-4 text-xs font-bold hover:bg-gold hover:text-dark transition-colors duration-200"
              >
                Cerrar Sesión
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 hidden md:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
