// Vista: Menu.js
// Componente para mostrar el menú del restaurante
// Visible sin login, con funcionalidad de búsqueda y filtrado por categoría

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuService from "../models/MenuService";
import "../styles/ChineseStyle.css";

const Menu = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  // Cargar menús al montar el componente
  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true);
      const result = await MenuService.getAllMenus();
      
      if (result.success) {
        setAllMenuItems(result.menus);
        // Extraer categorías únicas
        const uniqueCategories = [
          ...new Set(result.menus.map(item => item.category || "Sin categoría")),
        ];
        setCategories(uniqueCategories);
        setFilteredItems(result.menus);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadMenus();
  }, []);

  // Filtrar items por búsqueda y categoría
  useEffect(() => {
    let filtered = allMenuItems;

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        item => (item.category || "Sin categoría") === selectedCategory
      );
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          (item.name && item.name.toLowerCase().includes(search)) ||
          (item.description && item.description.toLowerCase().includes(search))
      );
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, allMenuItems]);

  const handleReserveClick = () => {
    if (!user) {
      // Mostrar alert y redirigir al login
      alert("Debes iniciar sesión para hacer una reserva");
      navigate("/login");
    } else {
      navigate("/reservations");
    }
  };

  if (loading) {
    return (
      <div className="menu-container">
        <div className="loading">Cargando menú...</div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Header del Menú */}
      <div className="menu-header">
        <div className="header-content">
          <button onClick={() => navigate("/")} className="back-button">
            ? Volver al Inicio
          </button>
          <h1>?? Menú del Restaurante</h1>
          <p className="menu-subtitle">Descubre nuestras deliciosas opciones</p>
        </div>
      </div>

      {/* Controles de búsqueda y filtrado */}
      <div className="menu-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="?? Buscar plato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <button
            className={category-btn }
            onClick={() => setSelectedCategory("all")}
          >
            Todos ({allMenuItems.length})
          </button>
          {categories.map((category) => {
            const count = allMenuItems.filter(
              item => (item.category || "Sin categoría") === category
            ).length;
            return (
              <button
                key={category}
                className={category-btn }
                onClick={() => setSelectedCategory(category)}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && <div className="error-message">Error: {error}</div>}

      {/* Resultado de búsqueda */}
      {filteredItems.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron platos</p>
          {searchTerm && (
            <p className="search-hint">Intenta con otro término de búsqueda</p>
          )}
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="menu-item-card">
              {/* Imagen del plato */}
              <div className="item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="image-placeholder">???</div>
                )}
              </div>

              {/* Información del plato */}
              <div className="item-content">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-category">{item.category || "Sin categoría"}</p>

                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}

                {item.allergens && item.allergens.length > 0 && (
                  <div className="item-allergens">
                    <span className="allergen-label">?? Alérgenos:</span>
                    <div className="allergen-list">
                      {item.allergens.map((allergen, idx) => (
                        <span key={idx} className="allergen-tag">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.price && (
                  <div className="item-footer">
                    <span className="item-price">€{item.price.toFixed(2)}</span>
                    {item.available === false && (
                      <span className="unavailable-badge">No disponible</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action para Reservar */}
      <section className="menu-cta">
        <h2>¿Te apetece probar nuestros platos?</h2>
        <button onClick={handleReserveClick} className="btn-primary btn-large">
          ?? Reservar una Mesa
        </button>
      </section>
    </div>
  );
};

export default Menu;
