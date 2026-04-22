// NavigationBar.js
// Componente de barra de navegación superior.
// Incluye logo del restaurante, enlaces a páginas principales y botones de autenticación.

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ChineseStyle.css";

const NavigationBar = ({ isAuthenticated, user, logout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav
      style={{
        backgroundColor: "#1a1a1a",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "3px solid #DC143C",
        minHeight: "60px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo/Nombre del restaurante */}
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <Link
          to="/"
          style={{
            color: "#DC143C",
            textDecoration: "none",
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "Georgia, serif",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#FF6B9D")}
          onMouseLeave={(e) => (e.target.style.color = "#DC143C")}
        >
          ?? Restaurant
        </Link>

        {/* Enlaces de navegación */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              color: "#E8E8E8",
              textDecoration: "none",
              fontSize: "14px",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
            onMouseLeave={(e) => (e.target.style.color = "#E8E8E8")}
          >
            Inicio
          </Link>
          <Link
            to="/menu"
            style={{
              color: "#E8E8E8",
              textDecoration: "none",
              fontSize: "14px",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
            onMouseLeave={(e) => (e.target.style.color = "#E8E8E8")}
          >
            Menú
          </Link>
          {isAuthenticated && (
            <Link
              to="/reservations"
              style={{
                color: "#E8E8E8",
                textDecoration: "none",
                fontSize: "14px",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#DC143C")}
              onMouseLeave={(e) => (e.target.style.color = "#E8E8E8")}
            >
              Reservas
            </Link>
          )}
        </div>
      </div>

      {/* Botones de autenticación o perfil de usuario */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {isAuthenticated ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleUserMenu}
              style={{
                backgroundColor: "#DC143C",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#FF6B9D")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#DC143C")
              }
            >
              ?? {user?.email?.split("@")[0] || "Usuario"}
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #DC143C",
                  borderRadius: "4px",
                  minWidth: "200px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                  zIndex: 101,
                }}
              >
                <Link
                  to="/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: "block",
                    padding: "10px 15px",
                    color: "#E8E8E8",
                    textDecoration: "none",
                    borderBottom: "1px solid #444",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#3a3a3a")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  ?? Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 15px",
                    color: "#E8E8E8",
                    backgroundColor: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#3a3a3a")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  ?? Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: "#E8E8E8",
                textDecoration: "none",
                fontSize: "14px",
                padding: "8px 16px",
                border: "1px solid #DC143C",
                borderRadius: "4px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#DC143C";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#E8E8E8";
              }}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              style={{
                backgroundColor: "#DC143C",
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                padding: "8px 16px",
                borderRadius: "4px",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#FF6B9D")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#DC143C")
              }
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
