import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import api from '../../api/petdate-api'
import { TIPO_COLOR } from '../servicios/serviciosData'
import './Home.css'

// ── Collage de fondo: 6 celdas (3 columnas × 2 filas)
// Reemplaza los src con tus fotos reales de mascotas
const bgPhotos = [
  { src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80', pos: 'center top'    }, // gato ojos verdes
  { src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', pos: 'center 55%'    }, // golden retriever
  { src: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80', pos: 'center center' }, // perro feliz
  { src: 'https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=800&q=80', pos: 'center center' }, // gato durmiendo
  { src: 'https://blog.mascotaysalud.com/wp-content/uploads/2025/08/seguro-veterinario-perros-gatos.jpg', pos: 'center 40%'    }, // perro con veterinario
  { src: 'https://i.pinimg.com/736x/3e/df/9d/3edf9dc3954c83ae2bf6e2ba8b082a7e.jpg', pos: 'center center' }, // Kida
]

const zoomDuration = ['22s', '27s', '19s', '24s', '29s', '21s']
const zoomDir      = ['normal', 'alternate', 'alternate', 'normal', 'normal', 'alternate']

const tips = [
  { id: 1, title: 'CUÁL ES LA FORMA CORRECTA DE LLEVAR A TU MASCOTA',     desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed...' },
  { id: 2, title: 'CÓMO PRESENTAR UNA NUEVA MASCOTA EN CASA',              desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed...' },
  { id: 3, title: 'QUÉ HACER SI TU GATO VOMITA',                           desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed...' },
  { id: 4, title: 'INFORMATIVO SOBRE EL EXAMEN SOMA DE IDEXX',             desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed...' },
]

function Home() {
  const [user, setUser]           = useState(null)
  const [promos, setPromos]       = useState([])
  const [cargandoPromos, setCargandoPromos] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    setUser(stored ? JSON.parse(stored) : null)

    const handleUserChange = () => {
      const updated = localStorage.getItem('user')
      setUser(updated ? JSON.parse(updated) : null)
    }

    window.addEventListener('userChanged', handleUserChange)
    return () => window.removeEventListener('userChanged', handleUserChange)
  }, [])

  useEffect(() => {
    const cargarPromos = async () => {
      try {
        const resultado = await api.promociones.listar({ size: 6 })
        const lista = resultado.content || []

        const idsUnicos = [...new Set(lista.map(p => p.idServicio))]
        const servicios = await Promise.all(idsUnicos.map(id => api.servicios.porId(id).catch(() => null)))
        const mapaServicios = Object.fromEntries(
          servicios.filter(Boolean).map(s => [s.idServicio, s])
        )

        const promosEnriquecidas = lista.map(p => ({
          id:          p.idPromocion,
          titulo:      p.titulo,
          descripcion: p.descripcion,
          servicio:    mapaServicios[p.idServicio] || null,
        })).filter(p => p.servicio)

        setPromos(promosEnriquecidas.slice(0, 3))
      } catch {
        setPromos([])
      } finally {
        setCargandoPromos(false)
      }
    }
    cargarPromos()
  }, [])

  return (
    <>
      <AppNavbar />

      {/* ══════════════════════════════════════════
          HERO — collage de fondo + texto centrado
          ══════════════════════════════════════════ */}
      <section className="hero" aria-label="Sección principal">

        {/* Collage 3×2 desaturado */}
        <div className="hero__collage" aria-hidden="true">
          {bgPhotos.map((photo, i) => (
            <div key={i} className="hero__cell">
              {photo.src ? (
                <img
                  src={photo.src}
                  alt=""
                  className="hero__cell-img"
                  style={{
                    objectPosition: photo.pos,
                    animationDuration: zoomDuration[i],
                    animationDirection: zoomDir[i],
                  }}
                />
              ) : (
                /* Placeholder hasta que agregues la foto */
                <div className="hero__cell-placeholder">
                  <span>🐾</span>
                  <p>Foto {i + 1}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Viñeta radial que aclara el centro */}
        <div className="hero__vignette" aria-hidden="true" />

        {/* Texto central */}
        <div className="hero__content">
          <p className="hero__eyebrow">Tu plataforma de mascotas en Chile</p>

          <h1 className="hero__title">PetDate</h1>

          <div className="hero__divider" aria-hidden="true" />

          <p className="hero__subtitle">
            Todo el cuidado que tu mascota merece,<br />en un solo lugar
          </p>

          <div className="hero__actions">
            <Link to="/servicios" className="hero__btn hero__btn--primary">
              Ver servicios
            </Link>
            {user && user.role === 'empresa' ? (
              <Link to="/mi-empresa" className="hero__btn hero__btn--outline">
                Mi Empresa
              </Link>
            ) : user ? (
              <Link to="/mis-mascotas" className="hero__btn hero__btn--outline">
                Mis Mascotas
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* FAB urgencias */}
      <Link to="/servicios?tipo=Veterinaria+24%2F7" className="fab">
        <span className="fab__icon">🚨</span>
        <span className="fab__label">Urgencia 24/7</span>
      </Link>

      {/* ══════ PROMOCIONES ══════ */}
      <section className="home-promos">
        <h2 className="home-promos__title">Promociones destacadas</h2>
        <div className="home-promos__grid">
          {cargandoPromos ? (
            <p className="text-muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
              Cargando promociones...
            </p>
          ) : promos.length === 0 ? (
            <p className="text-muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
              Aún no hay promociones activas.
            </p>
          ) : (
            promos.map((promo) => {
              const tipo  = promo.servicio.tipoServicio || ''
              const color = TIPO_COLOR[tipo] || '#7e6492'
              return (
                <div key={promo.id} className="promo-card">
                  <span className="promo-card__badge" style={{ backgroundColor: color }}>
                    {tipo}
                  </span>
                  <h3 className="promo-card__name">{promo.servicio.nombreServicio}</h3>
                  <p className="promo-card__desc" style={{ fontWeight: 600 }}>{promo.titulo}</p>
                  {promo.descripcion && <p className="promo-card__desc">{promo.descripcion}</p>}
                  <Link to="/servicios" className="promo-card__btn" style={{ display: 'inline-block', textDecoration: 'none' }}>Ver más</Link>
                </div>
              )
            })
          )}
          <div className="promo-card promo-card--all">
            <span className="promo-card__all-icon">🐾</span>
            <h3 className="promo-card__name">¿Quieres ver más?</h3>
            <p className="promo-card__desc">Explora todas las promociones disponibles.</p>
            <Link to="/servicios" className="promo-card__btn promo-card__btn--all" style={{ display: 'inline-block', textDecoration: 'none' }}>Ver todos</Link>
          </div>
        </div>
      </section>

      {/* ══════ QUIÉNES SOMOS ══════ */}
<section className="home-about">

  {/* Panel lila izquierdo */}
  <div className="home-about__panel">
    <h2 className="home-about__title">
      ¿Quiénes <em className="home-about__title--green">somos</em>
      <em className="home-about__title--green home-about__title--block">nosotros?</em>
    </h2>

    <div className="home-about__textbox">
      <p className="home-about__text">
        PetDate nace de una necesidad real: los dueños de mascotas merecen una forma
        simple, organizada y confiable de gestionar el bienestar de sus compañeros.
        Somos un equipo de tres estudiantes de Ingeniería apasionados por los animales
        y la tecnología, que decidimos crear la plataforma que siempre quisimos tener.
      </p>
    </div>

    <Link to="/nosotros" className="home-about__btn">
      Leer más sobre nosotros
    </Link>
  </div>

  {/* Columna derecha — espacio para foto */}
  <div className="home-about__photo">
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=85" alt="Nuestro equipo" />
  </div>

</section>

      {/* ══════ CONSEJOS ══════ */}
      <section className="home-tips">
        <div className="home-tips__header">
          <h2 className="home-tips__title">Consejos y cuidados</h2>
        </div>
        <div className="home-tips__grid">
          {tips.map((tip) => (
            <article key={tip.id} className="tip-card">
              <div className="tip-card__media"/>
              <div className="tip-card__body">
                <h3 className="tip-card__title">{tip.title}</h3>
                <p className="tip-card__desc">{tip.desc}</p>
                <button className="tip-card__btn">Leer ahora</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer/>
    </>
  )
}

export default Home