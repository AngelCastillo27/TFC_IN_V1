// App.js
// Componente principal de la aplicación React con React Router.
// Gestiona las rutas, autenticación y navegación de la aplicación.

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuth from "./controllers/useAuth";
import Login from "./views/Login";
import Register from "./views/Register";
import ForgotPassword from "./views/ForgotPassword";
import Dashboard from "./views/Dashboard";
import Home from "./views/Home";
import Menu from "./views/Menu";
import ReservationsView from "./views/ReservationsView";
import NavigationBar from "./components/NavigationBar";
import "./styles/ChineseStyle.css";

// Componente para rutas protegidas
const ProtectedRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#DC143C",
          fontSize: "18px",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  // Usar el hook de autenticación
  const { user, role, loading, logout } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Router>
      <NavigationBar isAuthenticated={isAuthenticated} user={user} logout={logout} />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        
        {/* Rutas de autenticación (solo si no está logueado) */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ForgotPassword />
            )
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <Dashboard role={role} userId={user?.uid} logout={logout} />
            </ProtectedRoute>
          }
        />

        {/* Ruta de reservas protegida (alternativa rápida) */}
        <Route
          path="/reservations"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <ReservationsView role={role} userId={user?.uid} />
            </ProtectedRoute>
          }
        />

        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
