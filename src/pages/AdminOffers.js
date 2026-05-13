// Vista: AdminOffers.js
// CRUD completo de ofertas para administradores.
// Importaciones corregidas desde models/ (no services/).
// Sin errores de sintaxis en template literals.

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import offerService from "../services/OfferService";
import menuService  from "../services/MenuService";
import { Button, Input } from "../components";

const EMPTY_FORM = {
  title:       "",
  description: "",
  discount:    "",
  startDate:   "",
  endDate:     "",
  active:      true,
};

const AdminOffers = () => {
  const [offers, setOffers]           = useState([]);
  const [dishes, setDishes]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterStatus, setFilter]     = useState("all");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [selectedDishes, setSelDishes] = useState([]);

  // Carga inicial
  useEffect(() => {
    loadOffers();
    loadDishes();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    const result = await offerService.getAllOffers();
    setLoading(false);
    if (result.success) setOffers(result.offers);
    else setError("Error al cargar ofertas: " + result.error);
  };

  const loadDishes = async () => {
    const result = await menuService.getAllMenus();
    if (result.success) setDishes(result.menus);
  };

  // Formulario - abrir nuevo
  const openNew = () => {
    setFormData(EMPTY_FORM);
    setSelDishes([]);
    setEditingId(null);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  // Formulario - abrir edicion
  const openEdit = (offer) => {
    setFormData({
      title:       offer.title       || "",
      description: offer.description || "",
      discount:    offer.discount    || "",
      startDate:   offer.startDate   || "",
      endDate:     offer.endDate     || "",
      active:      offer.active !== false,
    });
    setSelDishes(offer.dishIds || []);
    setEditingId(offer.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleDish = (id) => {
    setSelDishes((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.discount) {
      setError("Titulo y descuento son obligatorios.");
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }

    setLoading(true);
    setError(null);
    const payload = { ...formData, discount: parseInt(formData.discount), dishIds: selectedDishes };

    const result = editingId
      ? await offerService.updateOffer(editingId, payload, true)
      : await offerService.createOffer(payload, true);

    setLoading(false);
    if (result.success) {
      setSuccess(editingId ? "Oferta actualizada." : "Oferta creada.");
      setShowForm(false);
      setFormData(EMPTY_FORM);
      setSelDishes([]);
      setEditingId(null);
      loadOffers();
    } else {
      setError("Error al guardar: " + result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar esta oferta definitivamente?")) return;
    setLoading(true);
    const result = await offerService.deleteOffer(id, true);
    setLoading(false);
    if (result.success) { setSuccess("Oferta eliminada."); loadOffers(); }
    else setError("Error al eliminar: " + result.error);
  };

  const handleToggleActive = async (offer) => {
    const result = await offerService.updateOffer(offer.id, { active: !offer.active }, true);
    if (result.success) loadOffers();
    else setError("Error al cambiar estado.");
  };

  // Comprobar si una oferta esta en vigor ahora mismo
  const isEnVigor = (offer) => {
    if (!offer.active) return false;
    const now   = new Date();
    const start = offer.startDate ? new Date(offer.startDate) : null;
    const end   = offer.endDate   ? new Date(offer.endDate)   : null;
    if (start && now < start) return false;
    if (end   && now > end)   return false;
    return true;
  };

  // Filtros
  const filtered = offers.filter((o) => {
    const matchSearch =
      o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchStatus = true;
    if (filterStatus === "active")   matchStatus = o.active;
    if (filterStatus === "inactive") matchStatus = !o.active;
    if (filterStatus === "vigor")    matchStatus = isEnVigor(o);
    return matchSearch && matchStatus;
  });

  // Nombre de platos relacionados
  const getDishNames = (dishIds) => {
    if (!dishIds || dishIds.length === 0) return "Todos los platos";
    return dishIds
      .map((id) => dishes.find((d) => d.id === id)?.name || id)
      .join(", ");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-pearl px-4 py-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-dark">Gestión de Ofertas</h1>
          <Button 
            variant="primary"
            onClick={openNew}
            disabled={loading}
          >
            + Nueva Oferta
          </Button>
        </div>

        {/* Mensajes */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-sm mb-6"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-sm mb-6"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border-2 border-gold rounded-sm p-8 mb-8 shadow-soft"
            >
              <h2 className="text-2xl font-serif font-bold text-dark mb-6">
                {editingId ? "Editar Oferta" : "Nueva Oferta"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Título de la Oferta *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: Descuento Fin de Semana"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Descripción</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    rows={3} 
                    placeholder="Describe la oferta..."
                    className="w-full px-4 py-2.5 border-2 border-gold rounded-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Descuento (%) *"
                    name="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="Ej: 20"
                    required
                  />

                  <div className="flex items-end gap-2">
                    <input 
                      id="active-check"
                      name="active" 
                      type="checkbox" 
                      checked={formData.active} 
                      onChange={handleChange}
                      className="w-4 h-4 rounded-xs cursor-pointer"
                    />
                    <label htmlFor="active-check" className="text-sm font-medium text-dark cursor-pointer">
                      Oferta activa
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Fecha de Inicio"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                  />

                  <Input
                    label="Fecha de Fin"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>

                {/* Selector de platos */}
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Platos incluidos en la oferta (opcional)
                  </label>
                  <div className="flex flex-wrap gap-2 border-2 border-gold rounded-sm p-4 max-h-40 overflow-y-auto bg-pearl">
                    {dishes.length === 0 ? (
                      <span className="text-stone-gray text-sm">No hay platos disponibles</span>
                    ) : (
                      dishes.map((dish) => {
                        const checked = selectedDishes.includes(dish.id);
                        return (
                          <motion.label
                            key={dish.id}
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer text-sm font-medium transition-all ${
                              checked 
                                ? "bg-gold text-dark border-2 border-dark" 
                                : "bg-white border-2 border-gold text-dark hover:bg-gold hover:bg-opacity-20"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDish(dish.id)}
                              className="hidden"
                            />
                            {dish.name} ({parseFloat(dish.price || 0).toFixed(2)}€)
                          </motion.label>
                        );
                      })
                    )}
                  </div>
                  <p className="text-xs text-stone-gray mt-2">
                    {selectedDishes.length === 0
                      ? "Sin selección (aplica a todos los platos)"
                      : `${selectedDishes.length} plato(s) seleccionado(s)`}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar Oferta"}
                  </Button>
                  <Button 
                    variant="secondary"
                    type="button"
                    onClick={() => { 
                      setShowForm(false); 
                      setEditingId(null); 
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtros */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar oferta..."
            className="flex-1 px-4 py-2.5 border-2 border-gold rounded-sm font-sans min-w-60 focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gold rounded-sm font-sans min-w-40 focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
            <option value="vigor">En vigor ahora</option>
          </select>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Ofertas", value: offers.length },
            { label: "Activas", value: offers.filter((o) => o.active).length },
            { label: "En Vigor", value: offers.filter(isEnVigor).length },
            { label: "Desc. Promedio", value: offers.length > 0 ? Math.round(offers.reduce((s, o) => s + (o.discount || 0), 0) / offers.length) + "%" : "0%" },
          ].map((s) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-gold rounded-sm p-4 text-center shadow-subtle"
            >
              <div className="text-2xl font-bold text-gold">{s.value}</div>
              <div className="text-xs text-stone-gray">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-center text-stone-gray py-8"
          >
            Cargando...
          </motion.div>
        )}

        {/* Sin resultados */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-stone-gray py-12"
          >
            No hay ofertas que coincidan
          </motion.div>
        )}

        {/* Lista de ofertas */}
        {!loading && filtered.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filtered.map((offer, idx) => {
              const enVigor = isEnVigor(offer);
              return (
                <motion.div 
                  key={offer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  className={`bg-white border-2 rounded-sm p-6 shadow-soft transition-all ${
                    enVigor 
                      ? "border-green-400" 
                      : offer.active 
                      ? "border-gold" 
                      : "border-stone-gray"
                  }`}
                >
                  {/* Badges */}
                  <div className="flex gap-2 mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-xs ${
                      offer.active 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {offer.active ? "Activa" : "Inactiva"}
                    </span>
                    {enVigor && (
                      <span className="text-xs font-bold px-2 py-1 rounded-xs bg-gold text-dark">
                        En Vigor
                      </span>
                    )}
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="bg-gold text-dark rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                      -{offer.discount}%
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-serif font-bold text-dark mb-1">{offer.title}</h3>
                      {offer.description && (
                        <p className="text-sm text-stone-gray mb-2">{offer.description}</p>
                      )}
                      {offer.startDate && (
                        <p className="text-xs text-stone-gray mb-1">
                          Desde: {new Date(offer.startDate).toLocaleString("es-ES")}
                        </p>
                      )}
                      {offer.endDate && (
                        <p className="text-xs text-stone-gray mb-1">
                          Hasta: {new Date(offer.endDate).toLocaleString("es-ES")}
                        </p>
                      )}
                      <p className="text-sm text-dark">
                        <strong>Platos:</strong> {getDishNames(offer.dishIds)}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleActive(offer)}
                      disabled={loading}
                      className={`text-xs px-3 py-2 rounded-xs font-medium transition-all disabled:opacity-50 ${
                        offer.active
                          ? "bg-stone-gray text-white hover:bg-dark"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {offer.active ? "Desactivar" : "Activar"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEdit(offer)}
                      disabled={loading}
                      className="text-xs px-3 py-2 bg-gold text-dark rounded-xs font-medium hover:bg-gold-light transition-all"
                    >
                      Editar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(offer.id)}
                      disabled={loading}
                      className="text-xs px-3 py-2 bg-red-600 text-white rounded-xs font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      Eliminar
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminOffers;
