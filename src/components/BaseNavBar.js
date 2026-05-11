import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

/**
 * Navbar minimalista elegante
 * Línea dorada divisoria, padding generoso, tipografía Playfair Display
 */
export const BaseNavBar = ({
  logo,
  links = [],
  onLogout,
  userName,
  actions,
  className = '',
}) => {
  const [hoveredLink, setHoveredLink] = useState(null);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-pearl
        border-b border-gold
        sticky top-0 z-50
        ${className}
      `}
    >
      <div className="max-w-full mx-auto px-8 py-6">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer"
          >
            <h1 className="font-serif text-2xl font-bold text-dark tracking-tight">
              {logo}
            </h1>
          </motion.div>

          {/* Links Centrales */}
          <div className="flex gap-8 items-center">
            {links.map((link) => (
              <motion.div
                key={link.id}
                onMouseEnter={() => setHoveredLink(link.id)}
                onMouseLeave={() => setHoveredLink(null)}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="relative cursor-pointer"
              >
                <span
                  onClick={link.onClick}
                  className="text-sm font-medium text-dark tracking-wide hover:text-gold transition-colors duration-200"
                >
                  {link.label}
                </span>

                {/* Línea dorada animada en hover */}
                {hoveredLink === link.id && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Acciones (Usuario, Logout, etc) */}
          <div className="flex gap-4 items-center">
            {userName && (
              <span className="text-xs font-semibold text-stone-gray uppercase tracking-widest">
                {userName}
              </span>
            )}

            {actions && actions}

            {onLogout && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onLogout}
              >
                Salir
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default BaseNavBar;
