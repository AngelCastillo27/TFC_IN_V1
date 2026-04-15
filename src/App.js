// App.js
// Componente principal de la aplicación React.
// Renderiza el componente Login o Dashboard dependiendo del estado de autenticación.

import React from 'react';
import useAuth from './controllers/useAuth';
import Login from './views/Login';
import Dashboard from './views/Dashboard';

function App() {
  // Usar el hook de autenticación
  const { user, role, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si el usuario está logueado y tiene rol, mostrar Dashboard
  if (user && role) {
    return <Dashboard role={role} userId={user.uid} />;
  }

  // De lo contrario, mostrar Login
  return <Login />;
}

export default App;