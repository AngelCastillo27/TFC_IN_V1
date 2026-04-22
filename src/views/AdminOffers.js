// Vista: AdminOffers.js
// Componente para administración de ofertas y promociones
// Gestiona ofertas activas e inactivas con descuentos por tiempo limitado

import React, { useState, useEffect } from "react";
import OfferService from "../services/OfferService";
import MenuService from "../services/MenuService";
import "../styles/ChineseStyle.css";

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    startDate: "",
    endDate: "",
    active: true
  });

  // Cargar ofertas y platos al montar el componente
  useEffect(() => {
    loadOffers();
    loadDishes();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OfferService.getAllOffers();
      setOffers(data || []);
    } catch (err) {
      setError("Error al cargar las ofertas: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDishes = async () => {
    try {
      const data = await MenuService.getAllDishes();
      setDishes(data || []);
    } catch (err) {
      console.error("Error al cargar platos:", err);
    }
  };

  const handleAddNew = () => {
    setFormData({
      title: "",
      description: "",
      discount: "",
      startDate: "",
      endDate: "",
      active: true
    });
    setSelectedDishes([]);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount,
      startDate: offer.startDate,
      endDate: offer.endDate,
      active: offer.active
    });
    setSelectedDishes(offer.dishIds || []);
    setEditingId(offer.id);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleDishToggle = (dishId) => {
    setSelectedDishes(prev =>
      prev.includes(dishId)
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.discount) {
      setError("Por favor completa los campos requeridos");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    try {
      setLoading(true);
      const offerData = {
        ...formData,
        discount: parseInt(formData.discount),
        dishIds: selectedDishes
      };

      if (editingId) {
        await OfferService.updateOffer(editingId, offerData);
      } else {
        await OfferService.addOffer(offerData);
      }

      await loadOffers();
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        discount: "",
        startDate: "",
        endDate: "",
        active: true
      });
      setSelectedDishes([]);
    } catch (err) {
      setError("Error al guardar la oferta: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta oferta?")) {
      try {
        setLoading(true);
        await OfferService.deleteOffer(id);
        await loadOffers();
      } catch (err) {
        setError("Error al eliminar la oferta: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await OfferService.updateOffer(id, { active: !currentStatus });
      await loadOffers();
    } catch (err) {
      setError("Error al actualizar estado de oferta: " + err.message);
      console.error(err);
    }
  };

  const isOfferValid = (offer) => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    return offer.active && start <= now && now <= end;
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (offer.description && offer.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (filterStatus === "active") {
      matchesStatus = offer.active;
    } else if (filterStatus === "valid") {
      matchesStatus = isOfferValid(offer);
    } else if (filterStatus === "inactive") {
      matchesStatus = !offer.active;
    }

    return matchesSearch && matchesStatus;
  });

  const getRelatedDishes = (dishIds) => {
    return dishes.filter(d => dishIds && dishIds.includes(d.id));
  };

  return (
    <div className="admin-offers-container">
      <div className="admin-header">
        <h1>?? Administración de Ofertas</h1>
        <button 
          onClick={handleAddNew}
          disabled={loading}
          className="btn-primary btn-add-new"
        >
          ? Nueva Oferta
        </button>
      </div>

      {error && (
        <div className="error-message error-box">
          ?? {error}
        </div>
      )}

      {/* Formulario de edición/creación */}
      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? "Editar Oferta" : "Nueva Oferta"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Título de la Oferta *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Descuento Especial de Fin de Semana"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción detallada de la oferta..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Descuento (%) *</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  Oferta Activa
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Inicio *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha de Fin *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Platos Incluidos</label>
              <div className="dishes-selector">
                {dishes.length > 0 ? (
                  <div className="dishes-list">
                    {dishes.map(dish => (
                      <div key={dish.id} className="dish-checkbox-item">
                        <input
                          type="checkbox"
                          id={dish-}
                          checked={selectedDishes.includes(dish.id)}
                          onChange={() => handleDishToggle(dish.id)}
                        />
                        <label htmlFor={dish-}>
                          {dish.name} (€{dish.price.toFixed(2)})
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-dishes-message">No hay platos disponibles</p>
                )}
              </div>
            </div>

            <div className="form-buttons">
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Guardando..." : "Guardar Oferta"}
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="?? Buscar oferta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todas las ofertas</option>
          <option value="active">Activas</option>
          <option value="valid">En vigor</option>
          <option value="inactive">Inactivas</option>
        </select>
      </div>

      {/* Tabla de ofertas */}
      {loading && <p className="loading-text">Cargando...</p>}
      
      <div className="admin-table-container">
        {filteredOffers.length > 0 ? (
          <div className="offers-list">
            {filteredOffers.map(offer => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <div className="offer-title-section">
                    <h3 className="offer-title">{offer.title}</h3>
                    <div className="offer-badges">
                      <span className={adge \}>
                        {offer.active ? "? Activa" : "? Inactiva"}
                      </span>
                      {isOfferValid(offer) && (
                        <span className="badge badge-valid">?? En Vigor</span>
                      )}
                    </div>
                  </div>
                  <div className="offer-discount">
                    <span className="discount-value">-{offer.discount}%</span>
                  </div>
                </div>

                <div className="offer-body">
                  {offer.description && (
                    <p className="offer-description">{offer.description}</p>
                  )}

                  <div className="offer-dates">
                    <p>?? Inicio: {new Date(offer.startDate).toLocaleDateString("es-ES")} {new Date(offer.startDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p>?? Fin: {new Date(offer.endDate).toLocaleDateString("es-ES")} {new Date(offer.endDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>

                  {offer.dishIds && offer.dishIds.length > 0 && (
                    <div className="offer-dishes">
                      <p className="dishes-label">??? Platos Incluidos:</p>
                      <div className="dishes-tags">
                        {getRelatedDishes(offer.dishIds).map(dish => (
                          <span key={dish.id} className="dish-tag">
                            {dish.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="offer-stats">
                    <p>?? Platos en oferta: {offer.dishIds?.length || 0}</p>
                  </div>
                </div>

                <div className="offer-actions">
                  <button
                    onClick={() => handleToggleActive(offer.id, offer.active)}
                    className={tn-toggle \}
                    disabled={loading}
                  >
                    {offer.active ? "?? Desactivar" : "? Activar"}
                  </button>
                  <button 
                    onClick={() => handleEdit(offer)}
                    className="btn-edit"
                    disabled={loading}
                  >
                    ?? Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(offer.id)}
                    className="btn-delete"
                    disabled={loading}
                  >
                    ??? Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-message">No hay ofertas que coincidan con los filtros</p>
        )}
      </div>

      {/* Estadísticas de ofertas */}
      <div className="admin-stats">
        <div className="stat-box">
          <p className="stat-label">Total de Ofertas</p>
          <p className="stat-value">{offers.length}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Ofertas Activas</p>
          <p className="stat-value">{offers.filter(o => o.active).length}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">En Vigor</p>
          <p className="stat-value">{offers.filter(o => isOfferValid(o)).length}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Descuento Promedio</p>
          <p className="stat-value">
            {offers.length > 0 ? (offers.reduce((sum, o) => sum + o.discount, 0) / offers.length).toFixed(0) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminOffers;
