// Vista: Dashboard.js
// Este componente representa la ventana principal después del login.
// Incluye un sidebar con 5 opciones y contenido dinámico basado en el rol del usuario.
// Ahora incluye CRUD para cada sección.

import React from 'react';
import useDashboard from '../controllers/useDashboard';
import UsersView from './UsersView';
import ReservationsView from './ReservationsView';
import TablesView from './TablesView';

const Dashboard = ({ role, userId }) => {
  // Usar el hook del controlador
  const { selectedOption, availableOptions, selectOption } = useDashboard(role);

  // Componentes para cada opción
  const renderContent = () => {
    switch (selectedOption) {
      case 'inicio':
        return <div><h2>Inicio</h2><p>Bienvenido al sistema de reservas de restaurante.</p></div>;
      case 'reservas':
        return <ReservationsView role={role} userId={userId} />;
      case 'mesas':
        return <TablesView role={role} />;
      case 'usuarios':
        return role === 'admin' ? <UsersView /> : null;
      case 'configuracion':
        return role === 'admin' ? <div><h2>Configuración</h2><p>Configuraciones del sistema.</p></div> : null;
      default:
        return <div><h2>Opción no encontrada</h2></div>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <h3>Menú</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {availableOptions.map(option => (
            <li key={option.id} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => selectOption(option.id)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: selectedOption === option.id ? '#007bff' : '#fff',
                  color: selectedOption === option.id ? '#fff' : '#000',
                  border: '1px solid #ccc',
                  cursor: 'pointer'
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1, padding: '20px' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;