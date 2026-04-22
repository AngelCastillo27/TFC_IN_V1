// Vista: AdminMenu.js
// Componente para administración del menú
// Gestiona platos: crear, editar, eliminar, buscar y filtrar

import React, { useState, useEffect } from "react";
import MenuService from "../services/MenuService";
import "../styles/ChineseStyle.css";

const AdminMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categories] = useState([
    "Entradas",
    "Platos Principales",
    "Postres",
    "Bebidas",
    "Otros"
  ]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    allergens: "",
    imageUrl: ""
  });

  // Cargar todos los platos al montar el componente
  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MenuService.getAllDishes();
      setDishes(data || []);
    } catch (err) {
      setError("Error al cargar los platos: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      allergens: "",
      imageUrl: ""
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (dish) => {
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category: dish.category,
      allergens: dish.allergens || "",
      imageUrl: dish.imageUrl || ""
    });
    setEditingId(dish.id);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.price) {
      setError("Por favor completa los campos requeridos");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await MenuService.updateDish(editingId, formData);
      } else {
        await MenuService.addDish(formData);
      }
      
      await loadDishes();
      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        allergens: "",
        imageUrl: ""
      });
    } catch (err) {
      setError("Error al guardar el plato: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este plato?")) {
      try {
        setLoading(true);
        await MenuService.deleteDish(id);
        await loadDishes();
      } catch (err) {
        setError("Error al eliminar el plato: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await MenuService.updateDish(id, { available: !currentStatus });
      await loadDishes();
    } catch (err) {
      setError("Error al actualizar disponibilidad: " + err.message);
      console.error(err);
    }
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dish.description && dish.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || dish.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-menu-container">
      <div className="admin-header">
        <h1>??? Administración de Menú</h1>
        <button 
          onClick={handleAddNew}
          disabled={loading}
          className="btn-primary btn-add-new"
        >
          ? Agregar Nuevo Plato
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
          <h2>{editingId ? "Editar Plato" : "Nuevo Plato"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Nombre del Plato *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Peking Duck"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción del plato..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Alérgenos</label>
              <input
                type="text"
                name="allergens"
                value={formData.allergens}
                onChange={handleInputChange}
                placeholder="Ej: Cacahuetes, Lácteos"
              />
            </div>

            <div className="form-group">
              <label>URL de Imagen</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-buttons">
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Guardando..." : "Guardar"}
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
          placeholder="?? Buscar plato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Tabla de platos */}
      {loading && <p className="loading-text">Cargando...</p>}
      
      <div className="admin-table-container">
        {filteredDishes.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Descripción</th>
                <th>Alérgenos</th>
                <th>Disponibilidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDishes.map(dish => (
                <tr key={dish.id}>
                  <td className="dish-name">{dish.name}</td>
                  <td>{dish.category}</td>
                  <td className="dish-price">€{dish.price.toFixed(2)}</td>
                  <td className="dish-description">{dish.description?.substring(0, 40)}...</td>
                  <td>{dish.allergens || "-"}</td>
                  <td>
                    <button
                      onClick={() => handleToggleAvailability(dish.id, dish.available)}
                      className={vailability-btn }
                    >
                      {dish.available ? "? Disponible" : "? No disponible"}
                    </button>
                  </td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => handleEdit(dish)}
                      className="btn-edit"
                      disabled={loading}
                    >
                      ?? Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(dish.id)}
                      className="btn-delete"
                      disabled={loading}
                    >
                      ??? Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data-message">No hay platos que coincidan con los filtros</p>
        )}
      </div>

      <div className="admin-stats">
        <div className="stat-box">
          <p className="stat-label">Total de Platos</p>
          <p className="stat-value">{dishes.length}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Disponibles</p>
          <p className="stat-value">{dishes.filter(d => d.available).length}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">No Disponibles</p>
          <p className="stat-value">{dishes.filter(d => !d.available).length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;
