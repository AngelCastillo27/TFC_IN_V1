// Vista: Home.js
// Página de inicio del restaurante - Visible sin login requerido
// Muestra bienvenida, información del restaurante y call-to-action para reservas

import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChineseStyle.css";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="home-container">
      {/* Header con navegación */}
      <header className="home-header">
        <div className="header-content">
          <div className="restaurant-logo">
            <h1>?? Dragon Palace</h1>
            <p className="tagline">Auténtica Cocina China</p>
          </div>
          <nav className="header-nav">
            <button onClick={() => navigate("/menu")} className="nav-btn">
              ?? Ver Menú
            </button>
            {user ? (
              <>
                <button 
                  onClick={() => navigate("/dashboard")} 
                  className="nav-btn"
                >
                  ?? Mi Perfil
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem("user");
                    window.location.reload();
                  }} 
                  className="nav-btn btn-logout"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate("/login")} 
                  className="nav-btn"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => navigate("/register")} 
                  className="nav-btn btn-register"
                >
                  Registrarse
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Sección Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>¡Bienvenido a Dragon Palace!</h2>
          <p className="hero-subtitle">
            Descubre la más auténtica cocina china en un ambiente acogedor
          </p>
          <div className="hero-buttons">
            <button 
              onClick={() => navigate("/menu")} 
              className="btn-primary btn-large"
            >
              ??? Explorar Menú
            </button>
            <button 
              onClick={() => user ? navigate("/reservations") : navigate("/login")} 
              className="btn-secondary btn-large"
            >
              ?? Reservar Mesa
            </button>
          </div>
        </div>
      </section>

      {/* Información del Restaurante */}
      <section className="info-section">
        <div className="info-cards">
          <div className="info-card">
            <div className="card-icon">?????</div>
            <h3>Chefs Especializados</h3>
            <p>Con más de 20 años de experiencia en la gastronomía china tradicional</p>
          </div>
          <div className="info-card">
            <div className="card-icon">??</div>
            <h3>Ingredientes Premium</h3>
            <p>Seleccionamos cuidadosamente los mejores ingredientes importados</p>
          </div>
          <div className="info-card">
            <div className="card-icon">??</div>
            <h3>Ambiente Familiar</h3>
            <p>Un lugar perfecto para disfrutar en compañía de amigos y familia</p>
          </div>
        </div>
      </section>

      {/* Menú Destacado */}
      <section className="featured-section">
        <h2>Especialidades de la Casa</h2>
        <div className="featured-items">
          <div className="featured-item">
            <div className="item-image">??</div>
            <h4>Pato Pekinés</h4>
            <p>Receta tradicional con salsa agridulce</p>
            <p className="item-price">€18.50</p>
          </div>
          <div className="featured-item">
            <div className="item-image">??</div>
            <h4>Arroz Frito Especial</h4>
            <p>Con camarones, huevo y vegetales</p>
            <p className="item-price">€12.99</p>
          </div>
          <div className="featured-item">
            <div className="item-image">??</div>
            <h4>Noodles Salteados</h4>
            <p>A la manera de Chongqing</p>
            <p className="item-price">€11.50</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>¿Listo para reservar?</h2>
        <p>Haz tu reserva ahora y disfruta de una experiencia culinaria única</p>
        {user ? (
          <button 
            onClick={() => navigate("/reservations")} 
            className="btn-primary btn-large"
          >
            ?? Reservar Ahora
          </button>
        ) : (
          <>
            <p className="cta-login-message">Inicia sesión para hacer una reserva</p>
            <button 
              onClick={() => navigate("/login")} 
              className="btn-primary btn-large"
            >
              ?? Iniciar Sesión
            </button>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Dragon Palace</h4>
            <p>Calle Principal 123</p>
            <p>?? +34 900 123 456</p>
            <p>?? info@dragonpalace.es</p>
          </div>
          <div className="footer-section">
            <h4>Horario</h4>
            <p>Lunes a Jueves: 12:00 - 23:00</p>
            <p>Viernes a Sábado: 12:00 - 00:30</p>
            <p>Domingo: 13:00 - 23:00</p>
          </div>
          <div className="footer-section">
            <h4>Síguenos</h4>
            <p>Facebook | Instagram | TikTok</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Dragon Palace. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
