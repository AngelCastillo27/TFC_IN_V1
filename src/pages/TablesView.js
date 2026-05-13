// Vista: TablesView.js
// Componente para gestionar mesas (CRUD).

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTables from '../hooks/useTables';
import { Input } from '../components';

const TablesView = ({ role }) => {
  const { tables, loading, error, createTable, updateTable, deleteTable, loadAvailableTables } = useTables();
  const [formData, setFormData] = useState({ number: 1, capacity: 2, available: true });
  const [editingId, setEditingId] = useState(null);
  const [showAvailable, setShowAvailable] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateTable(editingId, formData);
      setEditingId(null);
    } else {
      await createTable(formData);
    }
    setFormData({ number: 1, capacity: 2, available: true });
  };

  const handleEdit = (table) => {
    setFormData({ number: table.number, capacity: table.capacity, available: table.available });
    setEditingId(table.id);
  };

  const toggleAvailable = () => {
    setShowAvailable(!showAvailable);
    if (!showAvailable) {
      loadAvailableTables();
    } else {
      // Recargar todas
    }
  };

  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-pearl flex items-center justify-center"
      >
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-lg text-stone-gray"
        >
          Cargando mesas...
        </motion.p>
      </motion.div>
    );
  if (error)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-pearl flex items-center justify-center"
      >
        <p className="text-lg text-red-600">Error: {error}</p>
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-pearl px-4 py-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-serif font-bold text-dark mb-8 pb-4 border-b-2 border-gold"
        >
          🪑 Mesas del Restaurante
        </motion.h2>

        {/* Toggle Available */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleAvailable}
            className="px-4 py-2 bg-gold text-dark rounded-xs font-serif font-bold hover:bg-gold-light transition-colors"
          >
            {showAvailable ? '📋 Mostrar Todas' : '✓ Mostrar Disponibles'}
          </motion.button>
        </motion.div>

        {/* Admin Form */}
        {role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gold rounded-sm p-6 mb-8 shadow-soft"
          >
            <h3 className="text-2xl font-serif font-bold text-dark mb-4">
              ➕ Crear Nueva Mesa
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Number Input */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Número de Mesa
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 1"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                  required
                />
              </div>

              {/* Capacity Input */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Capacidad
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 4"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })
                  }
                  min="1"
                  required
                />
              </div>

              {/* Available Checkbox */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                    className="w-5 h-5 accent-gold rounded-xs"
                  />
                  <span className="text-sm font-medium text-dark">Disponible</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gold text-dark rounded-xs font-serif font-bold hover:bg-gold-light transition-colors"
                >
                  {editingId ? '💾 Actualizar' : '➕ Crear'}
                </motion.button>
                {editingId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditingId(null)}
                    type="button"
                    className="px-4 py-2 border-2 border-stone-gray text-stone-gray rounded-xs font-serif font-bold hover:border-dark hover:text-dark transition-colors"
                  >
                    ✕ Cancelar
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        {/* Tables Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {tables.map((table, idx) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                className={`border-2 rounded-sm p-6 shadow-soft transition-all ${
                  table.available
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}
              >
                {/* Table Info */}
                <h4 className="text-2xl font-serif font-bold text-dark mb-3">
                  Mesa {table.number}
                </h4>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-dark">
                    <strong>👥 Capacidad:</strong> {table.capacity} personas
                  </p>
                  <p className={`text-sm font-medium ${
                    table.available ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <strong>📍 Estado:</strong>{' '}
                    {table.available ? '✓ Disponible' : '✗ Ocupada'}
                  </p>
                </div>

                {/* Admin Actions */}
                {role === 'admin' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEdit(table)}
                      className="flex-1 px-3 py-2 bg-gold text-dark rounded-xs font-medium hover:bg-gold-light transition-colors text-sm"
                    >
                      ✏️ Editar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => deleteTable(table.id)}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-xs font-medium hover:bg-red-200 transition-colors text-sm"
                    >
                      🗑️ Eliminar
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {tables.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-stone-gray">No hay mesas disponibles</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TablesView;