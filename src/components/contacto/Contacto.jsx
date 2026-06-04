import { useState } from 'react'
import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import { CheckCircle2 } from 'lucide-react'
import './Contacto.css'

const MAX_CHARS = 500
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Contacto() {
  const [form, setForm] = useState({ nombre: '', correo: '', mensaje: '' })
  const [touched, setTouched] = useState({ nombre: false, correo: false, mensaje: false })
  const [enviado, setEnviado] = useState(false)

  const errores = {
    nombre: form.nombre.trim() === '' ? 'El nombre o empresa es obligatorio.' : '',
    correo: form.correo.trim() === ''
      ? 'El correo electrónico es obligatorio.'
      : !EMAIL_REGEX.test(form.correo)
        ? 'Ingresa un correo válido (ej: usuario@dominio.cl)'
        : '',
    mensaje: form.mensaje.trim() === '' ? 'El mensaje o consulta es obligatorio.' : '',
  }

  const formularioValido = Object.values(errores).every((e) => e === '')

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'mensaje' && value.length > MAX_CHARS) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setTouched({ nombre: true, correo: true, mensaje: true })
    if (!formularioValido) return
    setEnviado(true)
    setForm({ nombre: '', correo: '', mensaje: '' })
    setTouched({ nombre: false, correo: false, mensaje: false })
  }

  const remaining = MAX_CHARS - form.mensaje.length

  return (
    <>
      <AppNavbar />

      {/* Hero */}
      <section className="contacto-hero">
        <div className="contacto-hero__content">
          <h1 className="contacto-hero__title">Contacto</h1>
          <p className="contacto-hero__slogan">¿Tienes alguna consulta? Estamos para ayudarte.</p>
        </div>
      </section>

      {/* Formulario */}
      <section className="contacto-section">
        <div className="contacto-card">

          {enviado ? (
            <div className="contacto-success">
              <CheckCircle2 size={48} className="contacto-success__icon" />
              <h2 className="contacto-success__title">¡Mensaje enviado!</h2>
              <p className="contacto-success__text">Gracias por contactarnos. Te responderemos a la brevedad.</p>
              <button className="contacto-btn" onClick={() => setEnviado(false)}>
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className="contacto-form" onSubmit={handleSubmit} noValidate>
              <h2 className="contacto-form__title">Escríbenos</h2>

              <div className="contacto-field">
                <label className="contacto-field__label" htmlFor="nombre">
                  Nombre o empresa <span className="contacto-field__required">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className={`contacto-field__input ${touched.nombre && errores.nombre ? 'contacto-field__input--error' : ''}`}
                  placeholder="Ej: Juan Pérez o Veterinaria PetCare"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.nombre && errores.nombre && (
                  <span className="contacto-field__error">{errores.nombre}</span>
                )}
              </div>

              <div className="contacto-field">
                <label className="contacto-field__label" htmlFor="correo">
                  Correo electrónico <span className="contacto-field__required">*</span>
                </label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  className={`contacto-field__input ${touched.correo && errores.correo ? 'contacto-field__input--error' : ''}`}
                  placeholder="Ej: contacto@ejemplo.cl"
                  value={form.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.correo && errores.correo && (
                  <span className="contacto-field__error">{errores.correo}</span>
                )}
              </div>

              <div className="contacto-field">
                <label className="contacto-field__label" htmlFor="mensaje">
                  Mensaje o consulta <span className="contacto-field__required">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  className={`contacto-field__textarea ${touched.mensaje && errores.mensaje ? 'contacto-field__input--error' : ''}`}
                  placeholder="Escribe tu consulta aquí..."
                  rows={5}
                  value={form.mensaje}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.mensaje && errores.mensaje && (
                  <span className="contacto-field__error">{errores.mensaje}</span>
                )}
                <span className={`contacto-field__counter ${remaining <= 50 ? 'contacto-field__counter--warn' : ''}`}>
                  {remaining} caracteres restantes
                </span>
              </div>

              <button type="submit" className="contacto-btn">
                Enviar mensaje
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Contacto
