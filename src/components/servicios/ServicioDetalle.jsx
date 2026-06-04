import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import { TIPO_COLOR, TIPO_ICON } from './serviciosData'
import { Store, MapPin, Clock, Phone, MessageCircle, Globe, Camera, User, Tag, PawPrint, Hourglass } from 'lucide-react'
import api from '../../api/petdate-api'
import './ServicioDetalle.css'

function resolverColor(tipoServicio) {
  return TIPO_COLOR[tipoServicio] || '#7e6492'
}

function resolverIcon(tipoServicio) {
  return TIPO_ICON[tipoServicio] || Store
}

function ServicioDetalle() {
  const { id } = useParams()
  const [servicio, setServicio]       = useState(null)
  const [promociones, setPromociones] = useState([])
  const [cargando, setCargando]       = useState(true)
  const [notFound, setNotFound]       = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [svc, promos] = await Promise.all([
          api.servicios.porId(id),
          api.promociones.porServicio(id, { size: 100 }),
        ])
        setServicio(svc)
        setPromociones(promos.content || [])
      } catch {
        setNotFound(true)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  if (cargando) return (
    <>
      <AppNavbar />
      <div className="detalle-notfound">
        <Hourglass size={30} />
        <p>Cargando servicio...</p>
      </div>
      <Footer />
    </>
  )

  if (notFound || !servicio) return (
    <>
      <AppNavbar />
      <div className="detalle-notfound">
        <PawPrint size={22} />
        <p>Servicio no encontrado.</p>
        <Link to="/servicios" className="detalle-back">← Volver a Servicios</Link>
      </div>
      <Footer />
    </>
  )

  const color   = resolverColor(servicio.tipoServicio)
  const TipoIcon = resolverIcon(servicio.tipoServicio)

  return (
    <>
      <AppNavbar />

      <div className="detalle-wrapper">
        <div className="detalle-breadcrumb">
          <Link to="/servicios" className="detalle-breadcrumb__link">← Volver a Servicios</Link>
        </div>

        <div className="detalle-layout">

          {/* ── Panel izquierdo: información ── */}
          <aside className="detalle-info">
            <div className="detalle-info__top" style={{ borderTopColor: color }}>
              <div className="detalle-info__icono"><TipoIcon size={28} /></div>
              <div>
                <span className="detalle-info__badge" style={{ backgroundColor: color }}>
                  {servicio.tipoServicio}
                </span>
                <h1 className="detalle-info__nombre">{servicio.nombreServicio}</h1>
              </div>
            </div>

            {servicio.descripcion && (
              <p className="detalle-info__desc">{servicio.descripcion}</p>
            )}

            <ul className="detalle-info__lista">
              {servicio.direccion && (
                <li>
                  <span className="detalle-info__lista-icon"><MapPin size={16} /></span>
                  <div>
                    <span className="detalle-info__lista-label">Dirección</span>
                    <span className="detalle-info__lista-valor">
                      {servicio.direccion}{servicio.comuna ? `, ${servicio.comuna}` : ''}
                    </span>
                  </div>
                </li>
              )}
              {servicio.horario && (
                <li>
                  <span className="detalle-info__lista-icon"><Clock size={16} /></span>
                  <div>
                    <span className="detalle-info__lista-label">Horario</span>
                    <span className="detalle-info__lista-valor">{servicio.horario}</span>
                  </div>
                </li>
              )}
              {servicio.telefono && (
                <li>
                  <span className="detalle-info__lista-icon"><Phone size={16} /></span>
                  <div>
                    <span className="detalle-info__lista-label">Teléfono</span>
                    <a className="detalle-info__lista-link" href={`tel:${servicio.telefono}`}>
                      {servicio.telefono}
                    </a>
                  </div>
                </li>
              )}
              {servicio.whatsApp && (
                <li>
                  <span className="detalle-info__lista-icon"><MessageCircle size={16} /></span>
                  <div>
                    <span className="detalle-info__lista-label">WhatsApp</span>
                    <a
                      className="detalle-info__lista-link detalle-info__lista-link--wsp"
                      href={`https://wa.me/${servicio.whatsApp}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir chat
                    </a>
                  </div>
                </li>
              )}
              {servicio.sitioWeb && (
                <li>
                  <span className="detalle-info__lista-icon"><Globe size={16} /></span>
                  <div>
                    <span className="detalle-info__lista-label">Sitio web</span>
                    <a
                      className="detalle-info__lista-link"
                      href={`https://${servicio.sitioWeb}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {servicio.sitioWeb}
                    </a>
                  </div>
                </li>
              )}
              {servicio.instagram && (
                <li>
                  <span className="detalle-info__lista-icon"><Camera size={16} /></span>
                  <div>
                    <span className="detalle-info__lista-label">Instagram</span>
                    <a
                      className="detalle-info__lista-link"
                      href={`https://instagram.com/${servicio.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{servicio.instagram}
                    </a>
                  </div>
                </li>
              )}
              {servicio.facebook && (
                <li>
                  <span className="detalle-info__lista-icon"><User size={16} /></span>
                  <div>
                    <span className="detalle-info__lista-label">Facebook</span>
                    <a
                      className="detalle-info__lista-link"
                      href={`https://facebook.com/${servicio.facebook}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {servicio.facebook}
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </aside>

          {/* ── Panel derecho: promociones ── */}
          <section className="detalle-promos">
            <h2 className="detalle-promos__title">
              <Tag size={18} /> Promociones
              {promociones.length > 0 && (
                <span className="detalle-promos__count">{promociones.length}</span>
              )}
            </h2>

            {promociones.length === 0 ? (
              <div className="detalle-promos__empty">
                <PawPrint size={22} />
                <p>Este servicio no tiene promociones activas por el momento.</p>
              </div>
            ) : (
              <div className="detalle-promos__lista">
                {promociones.map((promo) => (
                  <div key={promo.idPromocion} className="promo-detalle" style={{ borderLeftColor: color }}>
                    <h3 className="promo-detalle__titulo">{promo.titulo}</h3>
                    {promo.descripcion && <p className="promo-detalle__desc">{promo.descripcion}</p>}
                    <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Válido: {promo.fechaInicio} → {promo.fechaTermino}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      <Footer />
    </>
  )
}

export default ServicioDetalle
