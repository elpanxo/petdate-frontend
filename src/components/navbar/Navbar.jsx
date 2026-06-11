import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo/petdate-logo.png';
import { PawPrint, User, ClipboardList } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

function Navbar() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = 
    location.pathname === '/' ||
    location.pathname === '/contacto' ||
    location.pathname === '/nosotros' ||
    location.pathname === '/blogs' ||
    location.pathname === '/servicios';

  /* ── Detectar scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    // Al montar, resetear por si venimos de otra página
    setScrolled(window.scrollY > 40);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Cerrar drawer con Escape ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ── Bloquear scroll del body con drawer abierto ── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* ── Sincronizar usuario ── */
  useEffect(() => {
    const handleUserChange = () => {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChanged'));
    navigate('/');
  };

  /* En home: transparente hasta que scrolled=true.
     En otras páginas: siempre sólido */
  const transparent = isHome && !scrolled;

  return (
    <>
      <nav className={`navbar fixed-top petdate-nav ${transparent ? 'petdate-nav--transparent' : 'petdate-nav--solid'}`}>
        <div className="container-fluid px-4 d-flex align-items-center">

          {/* ── Brand ── */}
          <Link to="/" className="d-flex align-items-center gap-3 flex-shrink-0 text-decoration-none">
            <img
              src={logo}
              alt="PetDate"
              className="brand-logo"
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
            {/* El texto "PetDate" se oculta en home mientras no se haga scroll */}
            <span className={`brand-text ${transparent ? 'brand-text--hidden' : ''}`}>
              PetDate
            </span>
          </Link>

          {/* ── Links centro ── */}
          <div className="d-none d-md-flex justify-content-center flex-grow-1">
            <ul className="navbar-nav flex-row gap-4">
              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/nosotros">Nosotros</Link>
              </li>
              {user && user.role === 'empresa' ? (
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/mi-empresa">Mi Empresa</Link>
                </li>
              ) : user ? (
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/mis-mascotas">Mis Mascotas</Link>
                </li>
              ) : null}
              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/servicios">Servicios</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/blogs">Blogs</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/contacto">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* ── Botones derecha ── */}
          <div className="d-none d-md-flex align-items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                <span className="navbar-greeting">
                  Hola, {user.name} <PawPrint size={16} />
                </span>
                <button className="btn btn-logout" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-login">
                  <User size={16} /> Inicia Sesión
                </Link>
                <Link to="/register" className="btn btn-register">
                  <ClipboardList size={16} /> Registrate
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburguesa ── */}
          <button
            className="navbar-toggler d-md-none ms-auto"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      {/* ── Overlay mobile ── */}
      {open && (
        <div
          className="drawer-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Drawer lateral mobile ── */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`mobile-drawer ${open ? 'mobile-drawer--open' : ''}`}
      >
        <div className="mobile-drawer__header">
          <span className="brand-text">PetDate</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="drawer-close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <nav className="mobile-drawer__nav">
          <ul>
            {[
              { to: '/',            label: 'Inicio'       },
              { to: '/nosotros',    label: 'Nosotros'     },
              { to: '/servicios',   label: 'Servicios'    },
              { to: '/blogs',       label: 'Blogs'        },
              { to: '/contacto',    label: 'Contacto'     },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className="mobile-drawer__link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-drawer__footer">
          {user ? (
            <button className="btn btn-logout w-100" onClick={() => { handleLogout(); setOpen(false); }}>
              Cerrar Sesión
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="btn btn-login w-100 justify-content-center mb-2">
                <User size={16}/> Inicia Sesión
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn btn-register w-100 justify-content-center">
                <ClipboardList size={16}/> Registrate
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;