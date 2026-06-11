import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import aboutImg from '../../assets/roots/aboutus-header.jpg'
import { Heart, PawPrint, Telescope, HeartHandshake, Lightbulb } from 'lucide-react'
import './Nosotros.css'

// Foto 1×1 — agrega tu foto aquí
const heroPhoto = {
  src: aboutImg,
  pos: 'center center',
}

function Nosotros() {
  return (
    <>
      <AppNavbar />

      {/* ── Hero 1×1 con fondo foto ── */}
      <section className="nosotros-hero">

        {/* Foto de fondo */}
        <div className="nosotros-hero__bg" aria-hidden="true">
          {heroPhoto.src ? (
            <img
              src={heroPhoto.src}
              alt=""
              className="nosotros-hero__bg-img"
              style={{ objectPosition: heroPhoto.pos }}
            />
          ) : (
            <div className="nosotros-hero__bg-placeholder">🐾</div>
          )}
        </div>

        {/* Viñeta radial */}
        <div className="nosotros-hero__vignette" aria-hidden="true" />

        {/* Texto */}
        <div className="nosotros-hero__content">
          <h1 className="nosotros-hero__title">Nosotros</h1>
          <p className="nosotros-hero__slogan">Conoce quiénes somos y qué nos mueve cada día.</p>
        </div>

      </section>

       {/* Misión y Visión */}
      <section className="nosotros-mv">
        <div className="nosotros-mv__outer">
          <div className="nosotros-mv__grid">
 
            {/* Visión */}
            <div className="mv-card">
              <div className="mv-card__icon-wrap">
                <Telescope size={24} color="#5E438B" />
              </div>
              <h2 className="mv-card__title">Visión</h2>
              <hr className="mv-card__divider" />
              <p className="mv-card__text">
                Convertirse en la plataforma digital de referencia para la gestión y conexión de
                servicios para mascotas en Chile, facilitando la comunicación entre dueños y
                proveedores mediante una experiencia simple, confiable y accesible.
              </p>
            </div>
 
            {/* Misión */}
            <div className="mv-card">
              <div className="mv-card__icon-wrap">
                <PawPrint size={24} color="#5E438B" />
              </div>
              <h2 className="mv-card__title">Misión</h2>
              <hr className="mv-card__divider" />
              <p className="mv-card__text">
                Centralizar en una sola plataforma las necesidades de cuidado y gestión de mascotas,
                permitiendo a los usuarios organizar información, acceder a servicios y mantener una
                relación directa con veterinarias y negocios especializados, mediante herramientas
                digitales intuitivas y modernas.
              </p>
            </div>
 
          </div>
        </div>
      </section>
 
      {/* Valores */}
      <section className="nosotros-valores">
        <div className="nosotros-valores__outer">
          <div className="nosotros-valores__header">
            <h2 className="nosotros-valores__title">Nuestros valores</h2>
            <HeartHandshake size={26} color="#5E438B" />
          </div>
          <div className="nosotros-valores__grid">
            <div className="valor-card">
              <div className="valor-card__icon-wrap">
                <Heart size={26} color="#5E438B" />
              </div>
              <div className="valor-card__body">
                <h3 className="valor-card__name">Bienestar animal</h3>
                <p className="valor-card__desc">El cuidado y la salud de las mascotas es nuestra prioridad número uno.</p>
              </div>
            </div>
            <div className="valor-card">
              <div className="valor-card__icon-wrap">
                <HeartHandshake size={26} color="#5E438B" />
              </div>
              <div className="valor-card__body">
                <h3 className="valor-card__name">Confianza</h3>
                <p className="valor-card__desc">Promovemos relaciones transparentes y seguras entre dueños, proveedores y usuarios.</p>
              </div>
            </div>
            <div className="valor-card">
              <div className="valor-card__icon-wrap">
                <Lightbulb size={26} color="#5E438B" />
              </div>
              <div className="valor-card__body">
                <h3 className="valor-card__name">Innovación</h3>
                <p className="valor-card__desc">Desarrollamos soluciones digitales simples y modernas que simplifican la gestión.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      <Footer />
    </>
  )
}
 
export default Nosotros