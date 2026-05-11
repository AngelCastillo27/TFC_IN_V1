import React from 'react';
import { motion } from 'framer-motion';

/**
 * Contenedor minimalista con Framer Motion
 * Secciones planas separadas por líneas doradas
 */
export const Container = ({
  children,
  maxWidth = 'max-w-6xl',
  padding = 'px-6 py-8',
  borderTop = false,
  borderBottom = false,
  animate = false,
  className = '',
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      initial={animate ? 'hidden' : false}
      animate={animate ? 'visible' : false}
      variants={animate ? containerVariants : {}}
      className={`
        ${maxWidth}
        mx-auto
        ${padding}
        bg-white
        text-dark
        ${borderTop ? 'border-t border-gold' : ''}
        ${borderBottom ? 'border-b border-gold' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Container;
