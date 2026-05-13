import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import tableService from "../services/TableService";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Button, Input } from "../components";

const AdminTables = ({ userId, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingRes = location.state?.pendingAssignment || null;

  const [display, setDisplay] = useState([]);
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [dbPin, setDbPin] = useState("1234");
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState(null);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(userRole === "admin"); // Iniciar como true si es admin
  const [loading, setLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(true);


  // 1. CARGA DE MESAS REALES DESDE FIRESTORE
  useEffect(() => {
    const unsubscribe = tableService.subscribeToAllTables((result) => {
      setTablesLoading(false);
      if (result.success) {
        const sortedTables = [...result.tables].sort(
          (a, b) => (a.tableNumber || 0) - (b.tableNumber || 0),
        );
        setDisplay(sortedTables);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. VERIFICAR SI ES ADMIN Y CARGAR PIN EN TIEMPO REAL
  useEffect(() => {
    if (!userId) return;

    // La ruta AdminRoute ya verificó que es admin, así que confiamos en userRole
    if (userRole === "admin") {
      setIsAdmin(true);
    }

    // Listener en tiempo real para el PIN (SINCRONIZACIÓN)
    const unsubscribe = onSnapshot(doc(db, "users", userId), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        // Asegurar que si viene de la ruta protegida AdminRoute, es admin
        const isAdminFromDb = userData.role === "admin";
        if (isAdminFromDb) {
          setIsAdmin(true);
        }
        const pin = String(userData.adminPin || "1234").trim();
        setDbPin(pin);
      }
    }, (error) => {
      console.error("Error cargando PIN en tiempo real:", error);
    });

    return () => unsubscribe();
  }, [userId, userRole]);

  // 3. LÓGICA DE SELECCIÓN (FUSIÓN)
  const handleTableClick = (table) => {
    // Validar que sea admin
    if (!isAdmin) {
      alert("⚠️ Solo administradores pueden fusionar mesas.");
      return;
    }

    // Si no hay una reserva pendiente de asignar, el clic no hace nada
    if (!pendingRes || !table.active) return;

    // Si la mesa ya está ocupada por OTRA reserva, no deja seleccionarla
    if (table.reservationId && table.reservationId !== pendingRes.resId) {
      return alert("Esta mesa ya está ocupada.");
    }

    // Toggle de selección
    if (selectedMultiple.find((t) => t.tableNumber === table.tableNumber)) {
      setSelectedMultiple(
        selectedMultiple.filter((t) => t.tableNumber !== table.tableNumber),
      );
    } else {
      setSelectedMultiple([...selectedMultiple, table]);
    }
  };

  // 4. CONFIRMAR FUSIÓN (USAR NUEVO MÉTODO)
  const handleConfirmFusion = async () => {
    if (!isAdmin) {
      return alert("⚠️ Solo administradores pueden fusionar mesas.");
    }

    if (selectedMultiple.length === 0) {
      return alert("Selecciona al menos una mesa.");
    }

    try {
      setLoading(true);
      
      const tableIds = selectedMultiple
        .filter(t => t.id)
        .map(t => t.id);

      // Usar el nuevo método mergeTables de TableService
      const result = await tableService.mergeTables(
        pendingRes.resId,
        tableIds,
        Number(pendingRes.numberOfPeople) || 2
      );

      if (result.success) {
        alert(`✅ ${result.message}`);
        setSelectedMultiple([]);
        navigate("/reservations");
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error en fusión:", error);
      alert("Error al fusionar mesas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // LIBERAR/DESVINCULAR MESAS
  const handleReleaseTable = async (table) => {
    if (!isAdmin) {
      alert("⚠️ Solo administradores pueden desvincular mesas.");
      return;
    }

    if (!table.reservationId) {
      alert("Esta mesa no está fusionada.");
      return;
    }

    // Solicitar PIN
    const confirmPass = prompt("⚠️ Mesa FUSIONADA. Ingresa PIN de 4 dígitos:");
    if (!confirmPass) return;

    // Validar PIN
    if (confirmPass.trim() !== dbPin) {
      return alert("❌ PIN incorrecto.");
    }

    try {
      setLoading(true);
      
      // Obtener todas las mesas de esta reserva
      const tablesResult = await tableService.getTablesByReservation(table.reservationId);
      
      if (!tablesResult.success) {
        return alert("Error obteniendo mesas fusionadas");
      }

      const tableIdsToUnmerge = tablesResult.tables
        .filter(t => t.id)
        .map(t => t.id);

      // Usar el nuevo método unmergeTables
      const result = await tableService.unmergeTables(tableIdsToUnmerge);

      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error desvinculando:", error);
      alert("Error al desvincular mesas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseBusyTable = async (table) => {
    if (!isAdmin) {
      alert("⚠️ Solo administradores pueden liberar mesas.");
      return;
    }

    const confirmPass = prompt("⚠️ Mesa ocupada. Ingresa PIN de 4 dígitos:");
    if (!confirmPass) return;

    if (confirmPass.trim() !== dbPin) {
      return alert("❌ PIN incorrecto.");
    }

    try {
      setLoading(true);
      const result = await tableService.updateTable(table.id, {
        active: true,
        available: true,
        reservationId: null,
        mergedWith: [],
        fusionCode: null,
        lastModified: new Date().toISOString(),
      });

      if (!result.success) {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error liberando mesa:", error);
      alert("Error al liberar mesa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTableStatus = async (table, status) => {
    if (!isAdmin) {
      alert("⚠️ Solo administradores pueden cambiar el estado de mesas.");
      return;
    }

    if (!table.id) {
      alert("Esta mesa no tiene ID en Firestore.");
      return;
    }

    if (table.reservationId || (!table.available && table.active !== false)) {
      alert("Esta mesa está ocupada o fusionada. Libérala con PIN antes de modificarla.");
      return;
    }

    const updates =
      status === "disabled"
        ? { active: false, available: false }
        : { active: true, available: true };

    try {
      setLoading(true);
      const result = await tableService.updateTable(table.id, {
        ...updates,
        lastModified: new Date().toISOString(),
      });

      if (!result.success) {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error cambiando estado de mesa:", error);
      alert("Error al cambiar estado de mesa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // CAMBIAR PIN (SINCRONIZAR CON FIRESTORE)
  const handleChangePin = async () => {
    setPinError(null);
    setPinSuccess(false);

    // Validar PIN actual
    if (!currentPinInput || currentPinInput.trim() !== dbPin) {
      setPinError("PIN actual incorrecto");
      return;
    }

    // Validar nuevo PIN (4 dígitos)
    if (!newPin || !/^\d{4}$/.test(newPin)) {
      setPinError("El nuevo PIN debe ser 4 dígitos numéricos");
      return;
    }

    try {
      setLoading(true);
      
      // Actualizar en Firestore (con validación en reglas)
      await updateDoc(doc(db, "users", userId), { 
        adminPin: newPin 
      });

      setPinSuccess(true);
      setPinError(null);
      setCurrentPinInput("");
      setNewPin("");
      
      // El listener en tiempo real actualizará dbPin automáticamente
      setTimeout(() => {
        setShowPinSettings(false);
        setPinSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error cambiando PIN:", error);
      setPinError("Error al cambiar PIN: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar permisos
  if (!isAdmin) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-pearl flex items-center justify-center px-4"
      >
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-serif font-bold text-dark">⚠️ Acceso Denegado</h2>
          <p className="text-stone-gray text-lg">Solo administradores pueden acceder a esta vista.</p>
          <Button 
            variant="primary"
            onClick={() => navigate("/")}
          >
            Volver a Inicio
          </Button>
        </div>
      </motion.div>
    );
  }

  if (tablesLoading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-lg text-stone-gray"
        >
          Cargando mesas...
        </motion.div>
      </div>
    );
  }

  if (display.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-pearl flex items-center justify-center"
      >
        <p className="text-stone-gray text-xl">No hay mesas registradas en Firestore.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-pearl px-4 py-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-dark">⛩️ Plano de Mesas</h2>
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => setShowPinSettings(!showPinSettings)}
          >
            ⚙️ Ajustes PIN
          </Button>
        </div>

        {/* Banner de Fusión */}
        <AnimatePresence>
          {pendingRes && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-yellow-50 border-2 border-gold rounded-md p-6 mb-8"
            >
              <h3 className="text-xl font-serif font-bold text-dark mb-2">📍 Asignando a: {pendingRes.userName}</h3>
              <p className="text-stone-gray mb-4">Selecciona las mesas en el plano y pulsa Vincular</p>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleConfirmFusion}
                  disabled={selectedMultiple.length === 0 || loading}
                >
                  VINCULAR ({selectedMultiple.length})
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/reservations")}
                  disabled={loading}
                >
                  CANCELAR
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIN Settings */}
        <AnimatePresence>
          {showPinSettings && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-gold rounded-md p-6 mb-8 shadow-soft"
            >
              <h3 className="text-xl font-serif font-bold text-dark mb-4">🔐 Cambiar PIN de Seguridad</h3>
              
              {pinError && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 text-red-700 border border-red-200 rounded-xs p-3 mb-4"
                >
                  {pinError}
                </motion.div>
              )}
              
              {pinSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-50 text-green-700 border border-green-200 rounded-xs p-3 mb-4"
                >
                  ✅ PIN actualizado correctamente
                </motion.div>
              )}

              <Input
                label="PIN Actual (4 dígitos)"
                type="password"
                placeholder="••••"
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value.slice(0, 4))}
                maxLength="4"
              />
              
              <Input
                label="Nuevo PIN (4 dígitos)"
                type="password"
                placeholder="••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                maxLength="4"
              />

              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  onClick={handleChangePin}
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "💾 Guardar PIN"}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPinSettings(false);
                    setCurrentPinInput("");
                    setNewPin("");
                    setPinError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de Mesas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {display.map((table) => {
            const tableLabel = table.tableNumber || table.number || table.id;
            const isSelected = selectedMultiple.some(
              (t) => t.tableNumber === table.tableNumber,
            );
            const isDisabled = table.active === false;
            const isReserved = !!table.reservationId;
            const isBusy = !isDisabled && (!table.available || isReserved);
            const canChangeStatus = !isBusy && !isReserved && !!table.id;
            const fusionCode = table.fusionCode;

            // Determinar color de fondo basado en estado
            let bgClass = "bg-green-50 border-green-300";
            let textClass = "text-dark";
            
            if (isDisabled) {
              bgClass = "bg-red-50 border-red-300";
            } else if (isBusy) {
              bgClass = "bg-yellow-100 border-gold";
              textClass = "text-dark";
            }

            return (
              <motion.div
                key={table.id || tableLabel}
                onClick={() => handleTableClick(table)}
                whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                whileTap={{ y: 0 }}
                className={`
                  ${bgClass}
                  border-2 rounded-sm p-4 cursor-pointer
                  transition-all duration-250
                  min-h-40 flex flex-col justify-between
                  ${isSelected ? "ring-4 ring-gold ring-offset-2 ring-offset-pearl" : ""}
                `}
              >
                <div>
                  <strong className={`text-lg font-serif ${textClass}`}>Mesa {tableLabel}</strong>
                  {fusionCode && (
                    <div className="text-3xl font-bold text-gold my-2 leading-none tracking-tight">
                      {fusionCode}
                    </div>
                  )}
                  {isReserved && (
                    <div className="text-xs font-bold bg-gold text-dark rounded-xs px-2 py-1 inline-block mt-2">
                      {fusionCode ? "FUSIONADA" : "RESERVADA"}
                    </div>
                  )}
                  {isBusy && !isReserved && (
                    <div className="text-xs font-bold bg-gold text-dark rounded-xs px-2 py-1 inline-block mt-2">
                      OCUPADA
                    </div>
                  )}
                  {isDisabled && (
                    <div className="text-xs font-bold bg-red-500 text-white rounded-xs px-2 py-1 inline-block mt-2">
                      DESACTIVADA
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {!isBusy && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeTableStatus(table, "available");
                        }}
                        disabled={loading || !canChangeStatus || !isDisabled}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded-xs disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      >
                        Disponible
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeTableStatus(table, "disabled");
                        }}
                        disabled={loading || !canChangeStatus || isDisabled}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded-xs disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      >
                        Desactivar
                      </motion.button>
                    </>
                  )}

                  {isReserved && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReleaseTable(table);
                      }}
                      className="text-xs px-2 py-1 bg-orange-600 text-white rounded-xs transition-all hover:bg-orange-700"
                    >
                      Desvincular
                    </motion.button>
                  )}

                  {isBusy && !isReserved && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReleaseBusyTable(table);
                      }}
                      disabled={loading}
                      className="text-xs px-2 py-1 bg-orange-600 text-white rounded-xs disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Liberar
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminTables;
