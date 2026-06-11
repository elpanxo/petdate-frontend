import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import api, { ApiError } from '../../api/petdate-api'
import { TIPOS, TIPO_COLOR, TIPO_ICON } from './serviciosData'
import { Search, Hospital, Siren, Scissors, ShoppingCart, PawPrint, TriangleAlert, Hourglass, Store, MapPin, Clock } from 'lucide-react'
import './Servicios.css'

function normalizarTipo(tipoServicio) {
  if (!tipoServicio) return 'Otro'
  return tipoServicio.trim()
}

function extraerComunas(servicios) {
  const set = new Set(servicios.map(s => s.comuna).filter(Boolean))
  return ['Todas', ...Array.from(set).sort()]
}

function Servicios() {
  const [searchParams] = useSearchParams()

  const [tipoActivo, setTipoActivo] = useState(
    () => searchParams.get('tipo') || 'todos'
  )
  const [comunaActiva, setComunaActiva] = useState('Todas')
  const [busqueda, setBusqueda]         = useState('')

  const [servicios, setServicios] = useState([])
  const [comunas, setComunas]     = useState(['Todas'])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    const tipo = searchParams.get('tipo')
    setTipoActivo(tipo || 'todos')
  }, [searchParams])

  // Carga todos los servicios y filtra localmente
  // Evita problemas con caracteres especiales como '/' en path params
  const cargarServicios = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const page = await api.servicios.listar({ page: 0, size: 200 })
      const todos = page.content

      setComunas(extraerComunas(todos))

      let resultado = todos
      if (tipoActivo !== 'todos') {
        resultado = resultado.filter(s => s.tipoServicio === tipoActivo)
      }
      if (comunaActiva !== 'Todas') {
        resultado = resultado.filter(s => s.comuna === comunaActiva)
      }

      setServicios(resultado)
    } catch (err) {
      if (err instanceof ApiError) {
        setError('No se pudieron cargar los servicios. Intenta de nuevo.')
      } else {
        setError('Error de conexión. Verifica que el servidor esté activo.')
      }
    } finally {
      setLoading(false)
    }
  }, [tipoActivo, comunaActiva])

  useEffect(() => {
    cargarServicios()
  }, [cargarServicios])

  const filtrados = servicios.filter(s =>
    s.nombreServicio?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cambiarTipo = (valor) => {
    setTipoActivo(valor)
    setComunaActiva('Todas')
  }

  const cambiarComuna = (valor) => {
    setComunaActiva(valor)
    setTipoActivo('todos')
  }

  return (
    <>
      <AppNavbar />

      <section className="servicios-hero">
        <div className="servicios-hero__bg" aria-hidden="true">
          <div className="servicios-hero__bg-placeholder">🐾</div>
        </div>
        <div className="servicios-hero__vignette" aria-hidden="true" />
        <div className="servicios-hero__content">
          <h1 className="servicios-hero__title">Servicios</h1>
          <p className="servicios-hero__slogan">
            Encuentra veterinarias, urgencias, peluquerías y tiendas cerca de ti.
          </p>
        </div>
      </section>

      <section className="servicios-filtros">
        <div className="filtros-busqueda">
          <Search className="fab__icon" size={22} />
          <input
            type="text"
            className="filtros-busqueda__input"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filtros-row">
          <div className="filtros-grupo">
            <span className="filtros-grupo__label">Tipo de servicio</span>
            <div className="filtros-pills">
              {TIPOS.map(t => (
                <button
                  key={t.valor}
                  className={`filtro-pill ${tipoActivo === t.valor ? 'filtro-pill--activo' : ''}`}
                  onClick={() => cambiarTipo(t.valor)}
                >
                  {t.valor !== 'todos' && TIPO_ICON[t.valor] && (() => {
                    const FiltroIcon = TIPO_ICON[t.valor]
                    return <FiltroIcon size={15} style={{ color: TIPO_COLOR[t.valor] }} />
                  })()}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filtros-grupo">
            <span className="filtros-grupo__label">Comuna</span>
            <select
              className="filtros-select"
              value={comunaActiva}
              onChange={e => cambiarComuna(e.target.value)}
            >
              {comunas.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="servicios-section">
        {loading && (
          <div className="servicios-empty">
            <Hourglass className="fab__icon" size={30} />
            <p>Cargando servicios...</p>
          </div>
        )}

        {!loading && error && (
          <div className="servicios-empty">
            <TriangleAlert className="fab__icon" size={30} />
            <p>{error}</p>
            <button className="filtro-pill filtro-pill--activo" onClick={cargarServicios}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filtrados.length === 0 && (
          <div className="servicios-empty">
            <PawPrint className="fab__icon" size={30} />
            <p>No se encontraron servicios con los filtros aplicados.</p>
          </div>
        )}

        {!loading && !error && filtrados.length > 0 && (
          <>
            <p className="servicios-count">
              {filtrados.length} {filtrados.length === 1 ? 'resultado' : 'resultados'} encontrados
            </p>

            <div className="servicios-grid">
              {filtrados.map(s => {
                const tipo = normalizarTipo(s.tipoServicio)
                const TipoIcon = TIPO_ICON[tipo] || Store
                return (
                  <Link
                    key={s.idServicio}
                    to={`/servicios/${s.idServicio}`}
                    className="servicio-card"
                  >
                    <div
                      className="servicio-card__header"
                      style={{ borderLeftColor: TIPO_COLOR[tipo] || '#999' }}
                    >
                      <div className="servicio-card__icon">
                        <TipoIcon size={24} />
                      </div>
                      <div>
                        <span
                          className="servicio-card__badge"
                          style={{ backgroundColor: TIPO_COLOR[tipo] || '#999' }}
                        >
                          {s.tipoServicio}
                        </span>
                        <h3 className="servicio-card__nombre">{s.nombreServicio}</h3>
                      </div>
                    </div>

                    <p className="servicio-card__desc">{s.descripcion}</p>

                    <div className="servicio-card__footer">
                      {s.comuna  && <span className="servicio-card__dir"><MapPin size={13} /> {s.comuna}</span>}
                      {s.horario && (
                        <span className="servicio-card__horario">
                          <Clock size={13} /> {s.horario.split('·')[0].trim()}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </section>

      <Footer />
    </>
  )
}

export default Servicios