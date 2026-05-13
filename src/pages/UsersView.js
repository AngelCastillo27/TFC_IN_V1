// Vista: UsersView.js
// Componente para gestionar usuarios (CRUD) - Solo para admin.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useUsers from '../hooks/useUsers';
import { Input } from '../components';

const UsersView = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [formData, setFormData] = useState({ email: '', role: 'comensal', name: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateUser(editingId, formData);
      setEditingId(null);
    } else {
      await createUser(formData);
    }
    setFormData({ email: '', role: 'comensal', name: '' });
  };

  const handleEdit = (user) => {
    setFormData({ email: user.email, role: user.role, name: user.name || '' });
    setEditingId(user.id);
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
          Cargando usuarios...
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
          👥 Gestión de Usuarios
        </motion.h2>

        {/* Create/Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-gold rounded-sm p-6 mb-8 shadow-soft"
        >
          <h3 className="text-2xl font-serif font-bold text-dark mb-4">
            {editingId ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Nombre
              </label>
              <Input
                type="text"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gold rounded-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold transition-all"
              >
                <option value="comensal">Comensal</option>
                <option value="admin">Admin</option>
              </select>
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

        {/* Users Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {users.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-white border-2 border-gold rounded-sm p-6 shadow-soft"
              >
                {/* User Info */}
                <h4 className="text-xl font-serif font-bold text-dark mb-2">
                  {user.name || 'Sin nombre'}
                </h4>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-dark break-words">
                    <strong>📧 Email:</strong> {user.email}
                  </p>
                  <p className="text-sm text-dark">
                    <strong>🔑 Rol:</strong>{' '}
                    <span
                      className={`font-bold ${
                        user.role === 'admin'
                          ? 'text-gold'
                          : 'text-stone-gray'
                      }`}
                    >
                      {user.role === 'admin' ? '👨‍💼 Administrador' : '👤 Comensal'}
                    </span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEdit(user)}
                    className="flex-1 px-3 py-2 bg-gold text-dark rounded-xs font-medium hover:bg-gold-light transition-colors text-sm"
                  >
                    ✏️ Editar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => deleteUser(user.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-xs font-medium hover:bg-red-200 transition-colors text-sm"
                  >
                    🗑️ Eliminar
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {users.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-stone-gray">No hay usuarios registrados</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UsersView;