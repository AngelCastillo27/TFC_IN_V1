// NavigationBar.js
// Barra de navegacion superior adaptada al rol del usuario.
// Diseño responsivo y minimalista - Tailwind + Framer Motion

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NavigationBar = ({ isAuthenticated, user, role, logout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-pearl border-b border-gold sticky top-0 z-50 shadow-soft"
    >
      <div className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto w-full gap-4">
        {/* Logo */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="font-serif text-xl font-bold text-dark flex-shrink-0 hover:text-gold transition-colors duration-200"
        >
          Tsinghe
        </Link>

        {/* Menu Escritorio */}
        <div className="hidden md:flex gap-6 items-center flex-1 justify-center">
          {!isAuthenticated && (
            <>
              <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
                <Link
                  to="/"
                  className="text-sm font-medium text-dark hover:text-gold transition-colors duration-200"
                >
                  Inicio
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
                <Link
                  to="/menu"
                  className="text-sm font-medium text-dark hover:text-gold transition-colors duration-200"
                >
                  Menú
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Seccion Derecha */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isAuthenticated ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-gold text-white px-3 py-2 rounded-xs text-xs font-semibold max-w-[150px] overflow-hidden text-overflow-ellipsis whitespace-nowrap hover:bg-gold-light transition-colors duration-200"
              >
                {user?.email?.split("@")[0] || "Usuario"}
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-1 bg-white border border-gold rounded-xs min-w-[180px] shadow-md z-300"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-3 text-dark text-sm font-medium border-b border-gold hover:bg-pearl transition-colors duration-200"
                    >
                      Mi Panel
                    </Link>
                    {role === "admin" && (
                      <Link
                        to="/admin/menu"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 text-gold text-sm font-semibold border-b border-gold hover:bg-pearl transition-colors duration-200"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-gold text-sm font-semibold hover:bg-pearl transition-colors duration-200"
                    >
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gold border border-gold px-3 py-2 rounded-xs text-xs font-semibold hover:bg-gold hover:text-white transition-all duration-200"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="hidden md:block bg-gold text-white px-3 py-2 rounded-xs text-xs font-semibold hover:bg-gold-light transition-colors duration-200"
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default NavigationBar;
