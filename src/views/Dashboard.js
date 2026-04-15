// Vista: Dashboard.js
// Este componente representa la ventana principal después del login.
// Incluye un sidebar con 5 opciones y contenido dinámico basado en el rol del usuario.
// Ahora incluye CRUD para cada sección.

import React from "react";
import useDashboard from "../controllers/useDashboard";
import UsersView from "./UsersView";
import ReservationsView from "./ReservationsView";
import TablesView from "./TablesView";
import "../styles/ChineseStyle.css";

const Dashboard = ({ role, userId, logout }) => {
  // Usar el hook del controlador
  const { selectedOption, availableOptions, selectOption } = useDashboard(role);

  // Componentes para cada opción
  const renderContent = () => {
    switch (selectedOption) {
      case "inicio":
        return (
          <div>
            <h2>Inicio</h2>
            <p>Bienvenido al sistema de reservas de restaurante.</p>
            <p>Selecciona una opción del menú para comenzar.</p>
          </div>
        );
      case "reservas":
        return <ReservationsView role={role} userId={userId} />;
      case "mesas":
        return <TablesView role={role} />;
      case "usuarios":
        return role === "admin" ? <UsersView /> : null;
      case "configuracion":
        return role === "admin" ? (
          <div>
            <h2>Configuración</h2>
            <p>Configuraciones del sistema.</p>
          </div>
        ) : null;
      default:
        return (
          <div>
            <h2>Opción no encontrada</h2>
          </div>
        );
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>☯ Menú</h3>
        <ul>
          {availableOptions.map((option) => (
            <li key={option.id}>
              <button
                onClick={() => selectOption(option.id)}
                className={selectedOption === option.id ? "active" : ""}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Salir
        </button>
      </div>

      {/* Contenido principal */}
      <div className="main-content">{renderContent()}</div>
    </div>
  );
};

export default Dashboard;
