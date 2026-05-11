import React from 'react';
import { motion } from 'framer-motion';

/**
 * Input elegante con Framer Motion
 * Línea dorada en focus, animación sutil
 */
export const Input = React.forwardRef(({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {label && (
        <label className="block text-xs font-semibold text-dark uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full
          px-3 py-2.5
          bg-white
          border-b-2 border-stone-gray
          text-dark text-sm
          placeholder:text-stone-gray
          transition-all duration-250
          focus:outline-none
          focus:border-b-2 focus:border-gold
          disabled:bg-pearl disabled:opacity-50
          font-sans
          ${error ? 'border-b-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
});

Input.displayName = 'Input';

export default Input;
