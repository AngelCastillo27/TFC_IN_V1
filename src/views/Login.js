// Vista: Login.js
// Este componente representa la vista del formulario de login.
// Maneja la entrada del usuario y llama al controlador useAuth.

import React, { useState } from 'react';
import useAuth from '../controllers/useAuth';

const Login = () => {
  // Estados locales para el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Usar el hook del controlador
  const { user, loading, error, login, logout } = useAuth();

  // Manejador para el envío del formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      console.log('Login exitoso');
    }
  };

  // Si el usuario ya está logueado, mostrar mensaje
  if (user) {
    return (
      <div>
        <h2>Bienvenido, {user.email}</h2>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLoginSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;