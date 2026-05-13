// Vista: Menu.js
// Componente para mostrar el menú del restaurante
// Visible sin login, con funcionalidad de búsqueda y filtrado por categoría

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import useMenu from "../hooks/useMenu";
import { Button } from "../components";

const Menu = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { platos, categorias, alergenos, loading, error } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [excludedAlergenos, setExcludedAlergenos] = useState([]);

  const filteredPlatos = platos.filter(plato => {
    if (selectedCategory && plato.idCategoria !== selectedCategory) {
      return false;
    }

    if (excludedAlergenos.length > 0) {
      const platoAlergenos = Array.isArray(plato.alergenos) ? plato.alergenos : [];
      return !excludedAlergenos.some(alergenoId => platoAlergenos.includes(alergenoId));
    }

    return true;
  });

  const toggleExcludedAlergeno = (alergenoId) => {
    setExcludedAlergenos(prev =>
      prev.includes(alergenoId)
        ? prev.filter(id => id !== alergenoId)
        : [...prev, alergenoId]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setExcludedAlergenos([]);
  };

  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  const getCategoriaImagen = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.imagen : null;
  };

  const renderIcon = (imagen, label) => {
    if (!imagen) return null;

    const isUrl = typeof imagen === 'string' && (
      imagen.startsWith('http') ||
      imagen.startsWith('https') ||
      imagen.startsWith('data:') ||
      imagen.startsWith('/') ||
      /\/.+\.[a-zA-Z]{2,5}(\?.*)?$/.test(imagen)
    );

    return isUrl ? (
      <img src={imagen} alt={label} className="w-5 h-5" />
    ) : (
      <span>{imagen}</span>
    );
  };

  const getAlergenosNombres = (alergenosIds) => {
    return alergenos
      .filter(a => alergenosIds?.includes(a.id))
      .map(a => a.nombre)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-stone-gray">
        Cargando menú...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Error: {error}
      </div>
    );
  }

  // Agrupar platos por categoría
  const platosPorCategoria = filteredPlatos.reduce((acc, plato) => {
    const categoriaId = plato.idCategoria || 'sin-categoria';
    if (!acc[categoriaId]) {
      acc[categoriaId] = [];
    }
    acc[categoriaId].push(plato);
    return acc;
  }, {});

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="px-6 py-8 max-w-6xl mx-auto"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl font-serif font-bold text-dark text-center mb-12"
      >
        Nuestra Carta
      </motion.h1>

      {/* Filtros */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 p-6 bg-white border border-gold rounded-xs shadow-soft"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filtro por Categoría */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gold rounded-xs text-dark bg-pearl focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="">Todas</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Alérgenos */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Excluir Alérgenos
            </label>
            <div className="flex flex-wrap gap-2">
              {alergenos.map(alergeno => (
                <motion.button
                  key={alergeno.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleExcludedAlergeno(alergeno.id)}
                  className={`px-3 py-2 rounded-xs text-xs font-medium transition-colors duration-200 ${
                    excludedAlergenos.includes(alergeno.id)
                      ? 'bg-gold text-dark border border-gold'
                      : 'bg-pearl text-dark border border-gold'
                  }`}
                >
                  {renderIcon(alergeno.imagen, alergeno.nombre)} {alergeno.nombre}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetFilters}
          className="mt-4 px-6 py-2 bg-dark text-gold border border-gold rounded-xs text-sm font-semibold hover:bg-gold hover:text-dark transition-all duration-200"
        >
          Limpiar Filtros
        </motion.button>
      </motion.div>

      {/* Menú por categorías */}
      {Object.keys(platosPorCategoria).length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-stone-gray py-12"
        >
          No hay platos disponibles.
        </motion.p>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {Object.entries(platosPorCategoria).map(([categoriaId, platosCategoria]) => (
            <motion.div key={categoriaId} variants={itemVariants}>
              <h2 className="text-2xl font-serif font-bold text-dark border-b-2 border-gold pb-3 mb-8 flex items-center gap-3">
                {getCategoriaImagen(categoriaId) && renderIcon(getCategoriaImagen(categoriaId), getCategoriaNombre(categoriaId))}
                {getCategoriaNombre(categoriaId)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platosCategoria.map((plato, idx) => (
                  <motion.div
                    key={plato.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-gold rounded-xs p-5 shadow-soft hover:shadow-md transition-shadow duration-200"
                  >
                    {plato.imagen && (
                      <img
                        src={plato.imagen}
                        alt={plato.nombre}
                        className="w-full h-40 object-cover rounded-xs mb-4"
                      />
                    )}
                    <h3 className="text-lg font-serif font-bold text-dark mb-2">
                      {plato.nombre}
                    </h3>
                    <p className="text-sm text-stone-gray mb-3 leading-relaxed">
                      {plato.descripcion}
                    </p>
                    <p className="text-xl font-bold text-gold mb-3">
                      €{plato.precio?.toFixed(2)}
                    </p>
                    {plato.alergenos && plato.alergenos.length > 0 && (
                      <div className="text-xs text-stone-gray border-t border-gold pt-3">
                        <strong>Alérgenos:</strong> {getAlergenosNombres(plato.alergenos)}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Botón para reservar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-16"
      >
        <Button
          onClick={() => {
            const reservePath = '/dashboard?section=nueva-reserva';
            if (user) {
              if (role === 'admin') {
                navigate('/reservations');
              } else {
                navigate(reservePath);
              }
            } else {
              navigate(`/login?next=${encodeURIComponent(reservePath)}`);
            }
          }}
          variant="primary"
          size="lg"
        >
          {user ? (role === 'admin' ? 'Ver Reservas' : 'Ir a Nueva Reserva') : 'Iniciar Sesión para Reservar'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default Menu;