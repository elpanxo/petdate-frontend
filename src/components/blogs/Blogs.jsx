import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import { Stethoscope, Beef, Bath, Dog, Cat, Home as HomeIcon, Newspaper, Hourglass, TriangleAlert } from 'lucide-react'
import api, { BASE_URL } from '../../api/petdate-api'
import Comentarios from '../comentarios/Comentarios'
import './Blogs.css'

// ─────────────────────────────────────────────
// Estilo de respaldo cuando la entrada no tiene imagen propia
// (se elige de forma determinística según el id, para variar el look del grid)
// ─────────────────────────────────────────────
const ESTILOS_RESPALDO = [
  { bg: 'linear-gradient(135deg, #f5f0fa 0%, #d8c9ed 100%)', Icon: Stethoscope },
  { bg: 'linear-gradient(135deg, #eaf4f8 0%, #b8dce8 100%)', Icon: Beef },
  { bg: 'linear-gradient(135deg, #fff3ee 0%, #f5c9b0 100%)', Icon: Bath },
  { bg: 'linear-gradient(135deg, #f0ecfa 0%, #c9b8e8 100%)', Icon: Dog },
  { bg: 'linear-gradient(135deg, #e6f5f9 0%, #a8d5e5 100%)', Icon: Cat },
  { bg: 'linear-gradient(135deg, #fff0ea 0%, #f0b896 100%)', Icon: HomeIcon },
]

const estiloRespaldo = (id) => ESTILOS_RESPALDO[Number(id) % ESTILOS_RESPALDO.length]

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
}

const extracto = (texto, max = 160) => {
  if (!texto) return ''
  return texto.length > max ? `${texto.slice(0, max).trimEnd()}…` : texto
}

function Blogs() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError('')
      try {
        const page = await api.blogs.listar({ size: 30, sort: 'fecha,desc' })
        setPosts(page.content || [])
      } catch {
        setError('No se pudieron cargar las entradas del blog. Intenta de nuevo más tarde.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <>
      <AppNavbar />

      {/* Hero */}
      <section className="blogs-hero">
        <div className="blogs-hero__bg" aria-hidden="true">
          <div className="blogs-hero__bg-placeholder">🐾</div>
        </div>
        <div className="blogs-hero__vignette" aria-hidden="true" />
        <div className="blogs-hero__content">
          <h1 className="blogs-hero__title">Blog PetDate</h1>
          <p className="blogs-hero__slogan">Explora artículos, consejos y novedades sobre el cuidado de tus mascotas, escritos por los servicios de la comunidad.</p>
        </div>
      </section>

      {/* Grid de posts */}
      <section className="blogs-section">
        {loading && (
          <div className="blogs-estado">
            <Hourglass size={28} />
            <p>Cargando publicaciones...</p>
          </div>
        )}

        {!loading && error && (
          <div className="blogs-estado">
            <TriangleAlert size={28} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="blogs-estado">
            <Newspaper size={28} />
            <p>Todavía no hay publicaciones en el blog.</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="blogs-grid">
            {posts.map((post) => {
              const respaldo = estiloRespaldo(post.idBlog)
              return (
                <article key={post.idBlog} className="blog-card">
                  <div className="blog-card__image" style={post.imagen ? undefined : { background: respaldo.bg }}>
                    {post.imagen
                      ? <img src={`${BASE_URL}${post.imagen}`} alt={post.titulo} className="blog-card__foto" />
                      : <respaldo.Icon className="blog-card__emoji" size={48} />
                    }
                  </div>
                  <div className="blog-card__body">
                    {post.fecha && <span className="blog-card__fecha">{formatearFecha(post.fecha)}</span>}
                    <h3 className="blog-card__titulo">{post.titulo}</h3>
                    <p className="blog-card__extracto">{extracto(post.texto)}</p>
                    <button className="blog-card__btn" onClick={() => setSeleccionado(post)}>Ver más</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Modal: entrada completa */}
      <Modal show={!!seleccionado} onHide={() => setSeleccionado(null)} centered size="lg">
        {seleccionado && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{seleccionado.titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {seleccionado.imagen && (
                <img
                  src={`${BASE_URL}${seleccionado.imagen}`}
                  alt={seleccionado.titulo}
                  className="blog-modal__img"
                />
              )}
              {seleccionado.fecha && <p className="blog-modal__fecha">{formatearFecha(seleccionado.fecha)}</p>}
              <p className="blog-modal__texto">{seleccionado.texto}</p>

              <Comentarios tipo="blog" id={seleccionado.idBlog} />
            </Modal.Body>
          </>
        )}
      </Modal>

      <Footer />
    </>
  )
}

export default Blogs