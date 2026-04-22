// Vista: AdminTables.js
// Componente para administración de mesas
// Gestiona disponibilidad, capacidad y reservaciones en tiempo real

import React, { useState, useEffect } from "react";
import TableService from "../services/TableService";
import "../styles/ChineseStyle.css";

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableCapacities, setTableCapacities] = useState({});

  const TOTAL_TABLES = 20;
  const GRID_COLS = 5; // 5x4 grid

  // Cargar mesas al montar el componente
  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const tablesData = await TableService.getAllTables();
      setTables(tablesData || []);
    } catch (err) {
      setError("Error al cargar las mesas: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (tableNumber) => {
    try {
      const table = tables.find(t => t.tableNumber === tableNumber);
      if (table) {
        await TableService.updateTable(table.id, {
          available: !table.available
        });
        await loadTables();
      }
    } catch (err) {
      setError("Error al actualizar mesa: " + err.message);
      console.error(err);
    }
  };

  const handleTableClick = (tableNumber) => {
    const table = tables.find(t => t.tableNumber === tableNumber);
    setSelectedTable(table);
  };

  const handleCapacityChange = async (tableNumber, newCapacity) => {
    try {
      const table = tables.find(t => t.tableNumber === tableNumber);
      if (table) {
        await TableService.updateTable(table.id, {
          capacity: parseInt(newCapacity)
        });
        await loadTables();
      }
    } catch (err) {
      setError("Error al actualizar capacidad: " + err.message);
      console.error(err);
    }
  };

  const getTotalAvailable = () => tables.filter(t => t.available).length;
  const getTotalCapacity = () => tables.reduce((sum, t) => sum + (t.capacity || 0), 0);

  // Generar mesas si no existen
  useEffect(() => {
    if (tables.length === 0 && !loading) {
      // Se cargarán del servidor
    }
  }, []);

  const generateTableNumber = (index) => {
    return index + 1;
  };

  // Crear estructura de tabla si está vacía
  const displayTables = [];
  for (let i = 0; i < TOTAL_TABLES; i++) {
    const tableNum = generateTableNumber(i);
    const table = tables.find(t => t.tableNumber === tableNum) || {
      tableNumber: tableNum,
      available: true,
      capacity: 4,
      reservations: []
    };
    displayTables.push(table);
  }

  return (
    <div className="admin-tables-container">
      <div className="admin-header">
        <h1>?? Administración de Mesas</h1>
        <button 
          onClick={loadTables}
          disabled={loading}
          className="btn-primary btn-refresh"
        >
          ?? Actualizar
        </button>
      </div>

      {error && (
        <div className="error-message error-box">
          ?? {error}
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="admin-stats">
        <div className="stat-box">
          <p className="stat-label">Mesas Disponibles</p>
          <p className="stat-value">{getTotalAvailable()}/{TOTAL_TABLES}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Capacidad Total</p>
          <p className="stat-value">{getTotalCapacity()}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Ocupación</p>
          <p className="stat-value">{((TOTAL_TABLES - getTotalAvailable()) / TOTAL_TABLES * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="tables-grid-container">
        {loading ? (
          <p className="loading-text">Cargando mesas...</p>
        ) : (
          <div 
            className="tables-grid"
            style={{
              gridTemplateColumns: \epeat(\, 1fr)\,
              gap: "15px"
            }}
          >
            {displayTables.map((table, index) => (
              <div
                key={table.tableNumber}
                className={	able-item \}
                onClick={() => handleTableClick(table)}
                style={{
                  backgroundColor: table.available ? "#4CAF50" : "#f44336",
                  cursor: "pointer"
                }}
              >
                <div className="table-header">
                  <div className="table-number">Mesa {table.tableNumber}</div>
                  <div className={	able-status-badge \}>
                    {table.available ? "?" : "?"}
                  </div>
                </div>
                
                <div className="table-content">
                  <p className="table-capacity">
                    ?? {table.capacity || 4} personas
                  </p>
                  {table.reservations && table.reservations.length > 0 && (
                    <p className="table-reservations">
                      ?? {table.reservations.length} reserva(s)
                    </p>
                  )}
                </div>

                <div className="table-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAvailability(table.tableNumber);
                    }}
                    className="table-action-btn"
                    disabled={loading}
                  >
                    {table.available ? "?? Ocupar" : "? Liberar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel de detalles de mesa seleccionada */}
      {selectedTable && (
        <div className="table-detail-panel">
          <div className="panel-header">
            <h2>Detalles de Mesa {selectedTable.tableNumber}</h2>
            <button 
              onClick={() => setSelectedTable(null)}
              className="btn-close"
            >
              ?
            </button>
          </div>

          <div className="panel-content">
            <div className="detail-group">
              <label>Estado</label>
              <p className="detail-value">
                {selectedTable.available ? "? Disponible" : "? Ocupada"}
              </p>
              <button
                onClick={() => {
                  handleToggleAvailability(selectedTable.tableNumber);
                  setSelectedTable(null);
                }}
                className="btn-primary btn-toggle"
              >
                {selectedTable.available ? "Marcar como Ocupada" : "Marcar como Disponible"}
              </button>
            </div>

            <div className="detail-group">
              <label>Capacidad</label>
              <select
                value={selectedTable.capacity || 4}
                onChange={(e) => handleCapacityChange(selectedTable.tableNumber, e.target.value)}
                className="capacity-select"
              >
                <option value="2">2 personas</option>
                <option value="4">4 personas</option>
                <option value="6">6 personas</option>
                <option value="8">8 personas</option>
                <option value="10">10 personas</option>
                <option value="12">12 personas</option>
              </select>
            </div>

            {selectedTable.reservations && selectedTable.reservations.length > 0 && (
              <div className="detail-group">
                <label>Reservaciones</label>
                <div className="reservations-list">
                  {selectedTable.reservations.map((reservation, idx) => (
                    <div key={idx} className="reservation-item">
                      <p className="res-name">?? {reservation.customerName}</p>
                      <p className="res-time">?? {reservation.time}</p>
                      <p className="res-date">?? {reservation.date}</p>
                      <p className="res-guests">?? {reservation.numberOfGuests} personas</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-group">
              <label>Información Técnica</label>
              <p className="detail-value">
                <small>ID: {selectedTable.id}</small>
              </p>
              <p className="detail-value">
                <small>Creado: {selectedTable.createdAt ? new Date(selectedTable.createdAt).toLocaleDateString() : "N/A"}</small>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="tables-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unavailable"></div>
          <span>No Disponible/Ocupada</span>
        </div>
      </div>
    </div>
  );
};

export default AdminTables;
