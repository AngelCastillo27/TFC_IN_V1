// Controlador: useDashboard.js
// Este hook maneja la lógica del dashboard principal.
// Gestiona la selección de opciones del sidebar y permisos basados en el rol.

import { useState } from 'react';

const useDashboard = (role) => {
  // Estado para la opción seleccionada en el sidebar
  const [selectedOption, setSelectedOption] = useState('inicio');

  // Opciones disponibles en el sidebar
  const options = [
    { id: 'inicio', label: 'Inicio', roles: ['admin', 'comensal'] },
    { id: 'reservas', label: 'Reservas', roles: ['admin', 'comensal'] },
    { id: 'mesas', label: 'Mesas', roles: ['admin', 'comensal'] },
    { id: 'usuarios', label: 'Usuarios', roles: ['admin'] }, // Solo admin
    { id: 'configuracion', label: 'Configuración', roles: ['admin'] } // Solo admin
  ];

  // Filtrar opciones basadas en el rol
  const availableOptions = options.filter(option => option.roles.includes(role));

  // Función para seleccionar una opción
  const selectOption = (optionId) => {
    if (availableOptions.find(opt => opt.id === optionId)) {
      setSelectedOption(optionId);
    }
  };

  // Función para verificar si una opción está disponible para el rol
  const isOptionAvailable = (optionId) => {
    return availableOptions.some(opt => opt.id === optionId);
  };

  return {
    selectedOption,
    availableOptions,
    selectOption,
    isOptionAvailable
  };
};

export default useDashboard;