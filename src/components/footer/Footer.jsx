import { Link } from 'react-router-dom'
import logo from '../../assets/logo/petdate-logo.png'
import { Heart } from 'lucide-react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Columna 1: marca */}
        <div className="footer__col footer__col--brand">
          <Link to="/" className="footer__brand">
            <img src={logo} alt="PetDate" className="footer__logo" />
            <span className="footer__brand-name">PetDate</span>
          </Link>
          <p className="footer__slogan">
            La plataforma digital donde las mascotas y sus dueños encuentran todo lo que necesitan.
          </p>
          <p className="footer__legal">© 2026 PetDate — Todos los derechos reservados.</p>
        </div>

        {/* Columna 2: navegación rápida */}
        <div className="footer__col">
          <h4 className="footer__col-title">Navegación</h4>
          <ul className="footer__nav">
            <li><Link to="/" className="footer__link">Inicio</Link></li>
            <li><Link to="/nosotros" className="footer__link">Nosotros</Link></li>
            <li><Link to="/servicios" className="footer__link">Servicios</Link></li>
            <li><Link to="/blogs" className="footer__link">Blog</Link></li>
            <li><Link to="/contacto" className="footer__link">Contacto</Link></li>
          </ul>
        </div>

        {/* Columna 3: redes sociales */}
        <div className="footer__col">
          <h4 className="footer__col-title">Síguenos</h4>
          <ul className="footer__social">
            <li>
              <a
                href="https://instagram.com/petdate_cl"
                target="_blank"
                rel="noreferrer"
                className="footer__social-link"
              >
                <span className="footer__social-icon">Instagram</span>
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com/PetDateCL"
                target="_blank"
                rel="noreferrer"
                className="footer__social-link"
              >
                <span className="footer__social-icon">Facebook</span>
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/56900000000"
                target="_blank"
                rel="noreferrer"
                className="footer__social-link footer__social-link--wsp"
              >
                <span className="footer__social-icon">WhatsApp</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:contacto@petdate.cl"
                className="footer__social-link"
              >
                <span className="footer__social-icon">contacto@petdate.cl</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom">
        <span>Hecho con <Heart size={14} /> para las mascotas de Chile</span>
      </div>
    </footer>
  )
}

export default Footer
