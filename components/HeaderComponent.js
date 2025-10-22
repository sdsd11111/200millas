// HeaderComponent.js - Componente de navegación premium para 200 Millas Loja
import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaChevronDown, FaTimes, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './HeaderComponent.css';

const HeaderComponent = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Efecto para manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Efecto para manejar el cambio de tamaño de la ventana
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Cerrar menú al hacer clic en un enlace
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // Alternar menú móvil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  // Alternar menú desplegable
  const toggleDropdown = (e) => {
    if (isMobile) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-text">200 Millas</span>
            <span className="logo-subtext">Loja</span>
          </Link>

          {/* Botón de menú móvil */}
          <button 
            className="menu-toggle" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Navegación */}
          <nav className={`nav-container ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
              
              <li className={`dropdown ${isDropdownOpen ? 'active' : ''}`}>
                <Link 
                  to="#menu" 
                  className="dropdown-toggle"
                  onClick={toggleDropdown}
                  onMouseEnter={!isMobile ? () => setIsDropdownOpen(true) : null}
                >
                  Menú <FaChevronDown className="dropdown-icon" />
                </Link>
                
                <div 
                  className="dropdown-menu"
                  onMouseLeave={!isMobile ? () => setIsDropdownOpen(false) : null}
                >
                  <div className="dropdown-content">
                    <h3>Nuestro Menú</h3>
                    <div className="menu-categories">
                      <div className="menu-category">
                        <h4>Especialidades del Mar</h4>
                        <ul>
                          <li><Link to="/menu/pariguera" onClick={closeMenu}>Parigüera</Link></li>
                          <li><Link to="/menu/ceviche-mixto" onClick={closeMenu}>Ceviche Mixto</Link></li>
                          <li><Link to="/menu/arroz-marinero" onClick={closeMenu}>Arroz Marinero</Link></li>
                        </ul>
                      </div>
                      <div className="menu-category">
                        <h4>Platos Populares</h4>
                        <ul>
                          <li><Link to="/menu/camaron-reventado" onClick={closeMenu}>Camarón Reventado</Link></li>
                          <li><Link to="/menu/pollo-acullado" onClick={closeMenu}>Pollo Acullado</Link></li>
                          <li><Link to="/menu/ensalada-mariscos" onClick={closeMenu}>Ensalada de Mariscos</Link></li>
                        </ul>
                      </div>
                    </div>
                    <Link to="/menu" className="view-all" onClick={closeMenu}>Ver Menú Completo →</Link>
                  </div>
                </div>
              </li>
              
              <li><Link to="/gallery" onClick={closeMenu}>Galería</Link></li>
              <li><Link to="/contact" onClick={closeMenu}>Contacto</Link></li>
            </ul>

            {/* Botón de WhatsApp */}
            <div className="cta-container">
              <a 
                href="https://wa.me/593997533304" 
                className="whatsapp-button"
                target="_blank" 
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                <FaWhatsapp className="whatsapp-icon" />
                <span>Reservar por WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default HeaderComponent;
