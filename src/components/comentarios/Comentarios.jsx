import { useState, useEffect, useCallback } from 'react'
import { Star, MessageSquare, Pencil, Trash2, Hourglass, TriangleAlert } from 'lucide-react'
import api from '../../api/petdate-api'
import './Comentarios.css'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function obtenerUsuario() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Estrellas({ valor = 0, tamano = 16 }) {
  return (
    <span className="cm-estrellas" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={tamano}
          className={n <= valor ? 'cm-estrella cm-estrella--llena' : 'cm-estrella'}
        />
      ))}
    </span>
  )
}

function SelectorEstrellas({ valor, onChange, tamano = 24 }) {
  const [hover, setHover] = useState(0)
  return (
    <span className="cm-selector-estrellas">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="cm-selector-estrella-btn"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`Calificar con ${n} estrella${n > 1 ? 's' : ''}`}
        >
          <Star size={tamano} className={n <= (hover || valor) ? 'cm-estrella cm-estrella--llena' : 'cm-estrella'} />
        </button>
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

/**
 * Sección de comentarios y calificaciones, reutilizable para entradas de
 * blog y para servicios. Solo las cuentas de usuario (rol "cliente") pueden
 * crear, editar y eliminar SU PROPIO comentario; el listado es público.
 *
 * @param {'blog'|'servicio'} tipo
 * @param {number|string} id - idBlog o idServicio según corresponda
 * @param {string} [color]   - color de acento (por defecto el morado de PetDate)
 */
function Comentarios({ tipo, id, color = '#7e6492' }) {
  const usuario   = obtenerUsuario()
  const esCliente = !!usuario && usuario.role === 'cliente'
  const apiTipo   = tipo === 'blog' ? api.comentarios.blog : api.comentarios.servicio
  const campoId   = tipo === 'blog' ? 'idBlog' : 'idServicio'

  const [lista, setLista]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState('')

  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm]               = useState({ texto: '', calificacion: 0 })
  const [errForm, setErrForm]         = useState({})
  const [guardando, setGuardando]     = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const buscar = tipo === 'blog' ? apiTipo.porBlog : apiTipo.porServicio
      const page = await buscar(id, { size: 50, sort: 'fecha,desc' })
      setLista(page.content || [])
    } catch {
      setError('No se pudieron cargar los comentarios. Intenta de nuevo más tarde.')
    } finally {
      setCargando(false)
    }
  }, [tipo, id, apiTipo])

  useEffect(() => { cargar() }, [cargar])

  const propio = usuario ? lista.find((c) => c.idUsuario === usuario.id) : null
  const otros  = propio ? lista.filter((c) => c.id !== propio.id) : lista
  const promedio = lista.length
    ? lista.reduce((acc, c) => acc + (c.calificacion || 0), 0) / lista.length
    : 0

  const abrirNuevo = () => {
    setForm({ texto: '', calificacion: 0 })
    setErrForm({})
    setMostrarForm(true)
  }

  const abrirEditar = () => {
    if (!propio) return
    setForm({ texto: propio.texto, calificacion: propio.calificacion })
    setErrForm({})
    setMostrarForm(true)
  }

  const validar = () => {
    const errs = {}
    const texto = form.texto.trim()
    if (!texto) errs.texto = 'El comentario no puede estar vacío.'
    else if (texto.length > 100) errs.texto = 'Máximo 100 caracteres.'
    if (!form.calificacion) errs.calificacion = 'Selecciona una calificación de 1 a 5 estrellas.'
    return errs
  }

  const guardar = async () => {
    const errs = validar()
    if (Object.keys(errs).length) { setErrForm(errs); return }
    setGuardando(true)
    try {
      const payload = {
        [campoId]: Number(id),
        nombreUsuario: usuario?.name || usuario?.nombre || 'Usuario',
        texto: form.texto.trim(),
        calificacion: form.calificacion,
      }
      if (propio) {
        await apiTipo.actualizar(propio.id, payload)
      } else {
        await apiTipo.crear(payload)
      }
      setMostrarForm(false)
      await cargar()
    } catch {
      alert('No se pudo guardar tu comentario. Intenta nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!propio) return
    if (!window.confirm('¿Eliminar tu comentario y calificación?')) return
    try {
      await apiTipo.eliminar(propio.id)
      await cargar()
    } catch {
      alert('No se pudo eliminar el comentario. Intenta nuevamente.')
    }
  }

  return (
    <div className="cm-wrap">
      <div className="cm-header">
        <h2 className="cm-titulo"><MessageSquare size={18} /> Comentarios y calificaciones</h2>
        {lista.length > 0 && (
          <div className="cm-resumen">
            <Estrellas valor={Math.round(promedio)} />
            <span className="cm-promedio">{promedio.toFixed(1)} / 5</span>
            <span className="cm-conteo">({lista.length} {lista.length === 1 ? 'comentario' : 'comentarios'})</span>
          </div>
        )}
      </div>

      {cargando && (
        <div className="cm-estado"><Hourglass size={22} /><p>Cargando comentarios...</p></div>
      )}

      {!cargando && error && (
        <div className="cm-estado"><TriangleAlert size={22} /><p>{error}</p></div>
      )}

      {!cargando && !error && (
        <>
          {!usuario && (
            <p className="cm-aviso">Inicia sesión con una cuenta de usuario para dejar tu comentario y calificación.</p>
          )}
          {usuario && !esCliente && (
            <p className="cm-aviso">Solo las cuentas de usuario pueden comentar y calificar (esta cuenta es de empresa).</p>
          )}

          {esCliente && !propio && !mostrarForm && (
            <button className="cm-btn-primary" style={{ backgroundColor: color }} onClick={abrirNuevo}>
              Escribir un comentario
            </button>
          )}

          {mostrarForm && (
            <div className="cm-form">
              <label className="cm-form-label">Tu calificación</label>
              <div>
                <SelectorEstrellas
                  valor={form.calificacion}
                  onChange={(n) => { setForm((f) => ({ ...f, calificacion: n })); setErrForm((e) => ({ ...e, calificacion: null })) }}
                />
              </div>
              {errForm.calificacion && <small className="cm-error">{errForm.calificacion}</small>}

              <label className="cm-form-label">Tu comentario</label>
              <textarea
                className="cm-textarea"
                rows={3}
                maxLength={100}
                value={form.texto}
                onChange={(e) => { setForm((f) => ({ ...f, texto: e.target.value })); setErrForm((er) => ({ ...er, texto: null })) }}
                placeholder="Cuéntanos tu experiencia (máx. 100 caracteres)"
              />
              <div className="cm-form-footer">
                <small className="cm-contador">{form.texto.length}/100</small>
                {errForm.texto && <small className="cm-error">{errForm.texto}</small>}
              </div>

              <div className="cm-form-acciones">
                <button className="cm-btn-secondary" onClick={() => setMostrarForm(false)} disabled={guardando}>
                  Cancelar
                </button>
                <button className="cm-btn-primary" style={{ backgroundColor: color }} onClick={guardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}

          {propio && !mostrarForm && (
            <div className="cm-item cm-item--propio" style={{ borderLeftColor: color }}>
              <div className="cm-item-header">
                <div className="cm-item-autor-wrap">
                  <span className="cm-item-autor">{propio.nombreUsuario} <span className="cm-item-tu">(tú)</span></span>
                  <Estrellas valor={propio.calificacion} />
                </div>
                <span className="cm-item-fecha">{formatearFecha(propio.fecha)}</span>
              </div>
              <p className="cm-item-texto">{propio.texto}</p>
              <div className="cm-item-acciones">
                <button className="cm-btn-icono" onClick={abrirEditar}><Pencil size={15} /> Editar</button>
                <button className="cm-btn-icono cm-btn-icono--peligro" onClick={eliminar}><Trash2 size={15} /> Eliminar</button>
              </div>
            </div>
          )}

          {otros.length === 0 && !propio && (
            <div className="cm-vacio">
              <p>Todavía no hay comentarios. ¡Sé el primero en opinar!</p>
            </div>
          )}

          {otros.length > 0 && (
            <div className="cm-lista">
              {otros.map((c) => (
                <div key={c.id} className="cm-item">
                  <div className="cm-item-header">
                    <div className="cm-item-autor-wrap">
                      <span className="cm-item-autor">{c.nombreUsuario}</span>
                      <Estrellas valor={c.calificacion} />
                    </div>
                    <span className="cm-item-fecha">{formatearFecha(c.fecha)}</span>
                  </div>
                  <p className="cm-item-texto">{c.texto}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Comentarios
