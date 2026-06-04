import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import { Heart, PawPrint, Telescope, HeartHandshake, Lightbulb } from 'lucide-react'
import './Nosotros.css'

function Nosotros() {
  return (
    <>
      <AppNavbar />

      {/* Hero */}
      <section className="nosotros-hero">
        <div className="nosotros-hero__content">
          <h1 className="nosotros-hero__title">Nosotros</h1>
          <p className="nosotros-hero__slogan">Conoce quiénes somos y qué nos mueve cada día.</p>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="nosotros-mv">
        <div className="nosotros-mv__grid">

          {/* Visión */}
          <div className="mv-card mv-card--vision">
            <Telescope className="fab__icon" size={50} color='#5E438B' />
            <h2 className="mv-card__title">Visión</h2>
            <p className="mv-card__text">
              Convertirse en la plataforma digital de referencia para la gestión y conexión de
              servicios para mascotas en Chile, facilitando la comunicación entre dueños y
              proveedores mediante una experiencia simple, confiable y accesible.
            </p>
          </div>

          {/* Misión */}
          <div className="mv-card mv-card--mision">
            <PawPrint className="fab__icon" size={50} color='#5E438B' />
            <h2 className="mv-card__title">Misión</h2>
            <p className="mv-card__text">
              Centralizar en una sola plataforma las necesidades de cuidado y gestión de mascotas,
              permitiendo a los usuarios organizar información, acceder a servicios y mantener una
              relación directa con veterinarias y negocios especializados, mediante herramientas
              digitales intuitivas y modernas.
            </p>
          </div>

        </div>
      </section>

      {/* Valores */}
      <section className="nosotros-valores">
        <h2 className="nosotros-valores__title">Nuestros valores</h2>
        <div className="nosotros-valores__grid">
          <div className="valor-card">
            <Heart className="fab__icon" size={40} color='#5E438B'/>
            <h3 className="valor-card__name">Bienestar animal</h3>
            <p className="valor-card__desc">El cuidado y la salud de las mascotas es nuestra prioridad número uno.</p>
          </div>
          <div className="valor-card">
            <HeartHandshake className="fab__icon" size={40} color='#5E438B'/>
            <h3 className="valor-card__name">Confianza</h3>
            <p className="valor-card__desc">Conectamos dueños con proveedores verificados para una experiencia segura.</p>
          </div>
          <div className="valor-card">
            <Lightbulb className="fab__icon" size={40} color='#5E438B' />
            <h3 className="valor-card__name">Innovación</h3>
            <p className="valor-card__desc">Desarrollamos herramientas digitales modernas que simplifican la gestión.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Nosotros
