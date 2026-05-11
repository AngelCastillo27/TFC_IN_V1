import React from 'react';
import { motion } from 'framer-motion';

/**
 * Botón elegante minimalista con Framer Motion
 * Estilos: Tailwind CSS + animaciones sutiles
 * Paleta: Dorado (#C6A75E), Dorado suave hover (#D8C48A)
 */
export const Button = ({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  ...props
}) => {
  // Definir estilos por variante
  const variantStyles = {
    primary: 'bg-gold text-dark border border-gold hover:bg-gold-light',
    secondary: 'bg-pearl text-dark border-2 border-gold hover:bg-pearl',
    ghost: 'bg-transparent text-dark border border-stone-gray hover:border-gold',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs font-medium',
    md: 'px-4 py-2.5 text-sm font-medium',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.2 }}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-sm
        transition-all duration-250
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        font-sans
        tracking-wide
        focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-pearl
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
