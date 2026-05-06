import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import tableService from "../models/TableService";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const AdminTables = ({ userId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingRes = location.state?.pendingAssignment || null;

  const [display, setDisplay] = useState([]);
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [dbPin, setDbPin] = useState(null);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPin, setNewPin] = useState("");

  // 1. CARGA DE MESAS
  useEffect(() => {
    const unsubscribe = tableService.subscribeToAllTables((result) => {
      if (result.success) {
        const fullTables = [];
        for (let i = 1; i <= 20; i++) {
          const found = result.tables.find((t) => t.tableNumber === i);
          fullTables.push(
            found || {
              id: null,
              tableNumber: i,
              capacity: 4,
              active: true,
              available: true,
            },
          );
        }
        setDisplay(fullTables);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. CARGA DEL PIN
  useEffect(() => {
    if (!userId) return;
    const fetchPin = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setDbPin(String(userDoc.data().adminPin || "1234").trim());
        }
      } catch (error) {
        console.error("Error cargando PIN:", error);
      }
    };
    fetchPin();
  }, [userId]);

  // 3. LÓGICA DE SELECCIÓN (FUSIÓN)
  const handleTableClick = (table) => {
    // Si no hay una reserva pendiente de asignar, el clic no hace nada (evita errores)
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

  // 4. CONFIRMAR FUSIÓN
  const handleConfirmFusion = async () => {
    if (selectedMultiple.length === 0)
      return alert("Selecciona al menos una mesa.");

    for (const table of selectedMultiple) {
      await changeTableStatus(table, {
        available: false,
        active: true,
        reservationId: pendingRes.resId,
      });
    }
    alert("✅ Mesas vinculadas con éxito.");
    navigate("/reservations");
  };

  const handleReleaseTable = async (table) => {
    if (table.reservationId) {
      const confirmPass = prompt("⚠️ Mesa FUSIONADA. Ingresa PIN:");
      if (!confirmPass) return;
      if (confirmPass.trim() !== (dbPin || "1234"))
        return alert("PIN incorrecto.");
      await changeTableStatus(table, {
        active: true,
        available: true,
        reservationId: null,
      });
    } else {
      await changeTableStatus(table, {
        active: true,
        available: true,
        reservationId: null,
      });
    }
  };

  const changeTableStatus = async (table, updates) => {
    if (table.id) {
      await tableService.updateTable(table.id, updates);
    } else {
      await tableService.createTable({
        tableNumber: table.tableNumber,
        capacity: 4,
        ...updates,
      });
    }
  };

  // --- ESTILOS ---
  const tableGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "15px",
  };
  const tableCard = {
    padding: "12px",
    borderRadius: "12px",
    color: "white",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    minHeight: "140px",
    cursor: "pointer",
    position: "relative",
  };
  const badgeFusion = {
    fontSize: "10px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: "4px",
    padding: "3px 6px",
    marginTop: "5px",
    fontWeight: "bold",
  };
  const fusionBanner = {
    background: "#fffde7",
    padding: "15px",
    borderRadius: "12px",
    border: "2px solid #fbc02d",
    marginBottom: "20px",
    textAlign: "center",
  };

  if (display.length === 0) return <div>Cargando...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>⛩️ Plano de Mesas</h2>
        <button onClick={() => setShowPinSettings(!showPinSettings)}>
          ⚙️ Ajustes PIN
        </button>
      </div>

      {/* Banner de Fusión: Solo aparece si vienes de Reservas */}
      {pendingRes && (
        <div style={fusionBanner}>
          <h3>📍 Asignando a: {pendingRes.userName}</h3>
          <p>Selecciona las mesas en el plano y pulsa Vincular</p>
          <button
            onClick={handleConfirmFusion}
            style={{
              background: "#2e7d32",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            VINCULAR ({selectedMultiple.length})
          </button>
          <button
            onClick={() => navigate("/reservations")}
            style={{
              background: "#757575",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              marginLeft: "10px",
              cursor: "pointer",
            }}
          >
            CANCELAR
          </button>
        </div>
      )}

      {showPinSettings && (
        <div
          style={{
            background: "#f9f9f9",
            padding: "15px",
            border: "1px solid #ddd",
            marginBottom: "20px",
          }}
        >
          <input
            type="password"
            placeholder="PIN Actual"
            value={currentPinInput}
            onChange={(e) => setCurrentPinInput(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nuevo PIN"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
          />
          <button
            onClick={async () => {
              if (currentPinInput !== dbPin) return alert("Error");
              await updateDoc(doc(db, "users", userId), { adminPin: newPin });
              setDbPin(newPin);
              setShowPinSettings(false);
            }}
          >
            Guardar
          </button>
        </div>
      )}

      <div style={tableGrid}>
        {display.map((table) => {
          const isSelected = selectedMultiple.some(
            (t) => t.tableNumber === table.tableNumber,
          );
          const isOccupied = !table.available || table.reservationId;
          const bgColor = !table.active
            ? "#f44336"
            : isOccupied
              ? "#FFD700"
              : "#4CAF50";

          return (
            <div
              key={table.tableNumber}
              onClick={() => handleTableClick(table)}
              style={{
                ...tableCard,
                background: bgColor,
                border: isSelected ? "4px solid #333" : "1px solid #ddd",
                color: isOccupied && table.active ? "black" : "white",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>Mesa {table.tableNumber}</strong>
                {table.reservationId && (
                  <div style={badgeFusion}>🔗 FUSIONADA</div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "5px",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReleaseTable(table);
                  }}
                >
                  V
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeTableStatus(table, {
                      active: true,
                      available: false,
                    });
                  }}
                >
                  D
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeTableStatus(table, { active: false });
                  }}
                >
                  R
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTables;
