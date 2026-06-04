import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import AuthNavbar from '../navbar/AuthNavbar';
import { ApiError } from '../../api/petdate-api';
import api from '../../api/petdate-api';
import { PawPrint, Building2 } from 'lucide-react';
import { COMUNAS } from '../servicios/serviciosData';
import './Register.css';

const COMUNAS_LISTA = COMUNAS.filter(c => c !== 'Todas');

// ─────────────────────────────────────────────
// Rubros disponibles — tipoServicio que recibe el backend
// ─────────────────────────────────────────────
const RUBROS = [
  { label: 'Veterinaria',                 tipoServicio: 'Veterinaria' },
  { label: 'Veterinaria 24/7',            tipoServicio: 'Veterinaria 24/7' },
  { label: 'Servicios (Peluquería / Spa)', tipoServicio: 'Peluquería / Spa' },
  { label: 'Tienda de mascotas',           tipoServicio: 'Tienda de mascotas' },
];

const FORM_CLIENTE_INICIAL = {
  nombre: '',
  email: '',
  telefono: '',
  password: '',
  confirm: '',
};

const FORM_EMPRESA_INICIAL = {
  empresa: '',
  rubro: RUBROS[0].tipoServicio,
  rut: '',
  direccion: '',
  comuna: '',
  telefono: '',
  email: '',
  password: '',
  confirm: '',
  terminos: false,
};

// ─────────────────────────────────────────────
// Helpers de validación local
// ─────────────────────────────────────────────
function validarCliente(c) {
  if (c.password !== c.confirm)    return 'Las contraseñas no coinciden';
  if (c.password.length < 6)       return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

function validarEmpresa(e) {
  if (!e.terminos)                  return 'Debes aceptar los términos y condiciones';
  if (e.password !== e.confirm)     return 'Las contraseñas no coinciden';
  if (e.password.length < 6)        return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────
const Register = () => {
  const [tipo, setTipo] = useState('cliente');
  const navigate = useNavigate();

  // Estado formulario cliente
  const [cliente, setCliente]           = useState(FORM_CLIENTE_INICIAL);
  const [errorCliente, setErrorCliente] = useState('');
  const [loadingCliente, setLoadingCliente] = useState(false);

  // Estado formulario empresa
  const [empresa, setEmpresa]           = useState(FORM_EMPRESA_INICIAL);
  const [errorEmpresa, setErrorEmpresa] = useState('');
  const [loadingEmpresa, setLoadingEmpresa] = useState(false);

  const campoCliente = (field, value) => setCliente(p => ({ ...p, [field]: value }));
  const campoEmpresa = (field, value) => setEmpresa(p => ({ ...p, [field]: value }));

  // ── Registro cliente ────────────────────────
  const handleCliente = async (e) => {
    e.preventDefault();
    setErrorCliente('');

    const errorLocal = validarCliente(cliente);
    if (errorLocal) return setErrorCliente(errorLocal);

    setLoadingCliente(true);
    try {
      // POST /usuarios  (ruta pública, no requiere token)
      const usuarioCreado = await api.usuarios.crear({
        nombre:     cliente.nombre,
        correo:     cliente.email,
        contrasena: cliente.password,
        telefono:   cliente.telefono,
      });

      // Login automático tras el registro
      await api.auth.login(cliente.email, cliente.password);

      // Guardamos datos mínimos del usuario para la UI
      localStorage.setItem('user', JSON.stringify({
        id:    usuarioCreado.id,
        email: usuarioCreado.correo,
        name:  usuarioCreado.nombre,
        role:  'cliente',
      }));
      window.dispatchEvent(new Event('userChanged'));
      navigate('/mis-mascotas');

    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setErrorCliente('Este correo ya está registrado');
        else setErrorCliente(err.message || 'Error al crear la cuenta');
      } else {
        setErrorCliente('Error de conexión. Verifica que el servidor esté activo.');
      }
    } finally {
      setLoadingCliente(false);
    }
  };

  // ── Registro empresa ─────────────────────────
  const handleEmpresa = async (e) => {
    e.preventDefault();
    setErrorEmpresa('');

    const errorLocal = validarEmpresa(empresa);
    if (errorLocal) return setErrorEmpresa(errorLocal);

    setLoadingEmpresa(true);
    try {
      // POST /servicios  (ruta pública, no requiere token)
      const servicioCreado = await api.servicios.crear({
        nombreServicio: empresa.empresa,
        tipoServicio:   empresa.rubro,
        rutEmpresa:     empresa.rut,
        correo:         empresa.email,
        contrasena:     empresa.password,
        direccion:      empresa.direccion,
        comuna:         empresa.comuna,
        telefono:       empresa.telefono,
      });

      localStorage.setItem('user', JSON.stringify({
        id:         servicioCreado.idServicio,
        email:      servicioCreado.correo,
        name:       servicioCreado.nombreServicio,
        role:       'empresa',
        servicioId: servicioCreado.idServicio,
        rut:        empresa.rut,
        contrasena: empresa.password,
      }));
      window.dispatchEvent(new Event('userChanged'));
      navigate('/mi-empresa');

    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setErrorEmpresa('Este correo ya está registrado');
        else setErrorEmpresa(err.message || 'Error al registrar la empresa');
      } else {
        setErrorEmpresa('Error de conexión. Verifica que el servidor esté activo.');
      }
    } finally {
      setLoadingEmpresa(false);
    }
  };

  const switchTo = (t) => {
    setErrorCliente('');
    setErrorEmpresa('');
    setTipo(t);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <>
      <AuthNavbar />
      <div className="reg-page">

        {/* ── Panel Cliente ── */}
        <div
          className={`reg-panel reg-panel--cliente ${tipo === 'cliente' ? 'reg-panel--active' : 'reg-panel--inactive'}`}
          onClick={tipo !== 'cliente' ? () => switchTo('cliente') : undefined}
        >
          {tipo !== 'cliente' ? (
            <div className="reg-teaser">
              <PawPrint size={40} className="reg-teaser-icon" />
              <h2>Dueño de mascota</h2>
              <p>Crea tu cuenta como cliente</p>
              <span className="reg-teaser-cta">Regístrate aquí →</span>
            </div>
          ) : (
            <div className="reg-form-wrap">
              <h2 className="reg-form-title"><PawPrint size={20} /> Crear cuenta</h2>
              <p className="reg-form-sub">Registro de dueño de mascota</p>

              {errorCliente && <div className="reg-error">{errorCliente}</div>}

              <Form onSubmit={handleCliente}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    placeholder="Tu nombre"
                    value={cliente.nombre}
                    onChange={e => campoCliente('nombre', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={cliente.email}
                    onChange={e => campoCliente('email', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={cliente.telefono}
                    onChange={e => campoCliente('telefono', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={cliente.password}
                    onChange={e => campoCliente('password', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={cliente.confirm}
                    onChange={e => campoCliente('confirm', e.target.value)}
                    required
                  />
                </Form.Group>

                <button
                  type="submit"
                  className="reg-btn reg-btn--cliente"
                  disabled={loadingCliente}
                >
                  {loadingCliente ? 'Registrando...' : 'Registrarme como cliente'}
                </button>

                <div className="reg-login-link">
                  <span className="text-muted">¿Ya tienes cuenta? </span>
                  <Link to="/login">Inicia sesión aquí</Link>
                </div>
              </Form>
            </div>
          )}
        </div>

        {/* ── Divisor ── */}
        <div className="reg-divider"><span>o</span></div>

        {/* ── Panel Empresa ── */}
        <div
          className={`reg-panel reg-panel--empresa ${tipo === 'empresa' ? 'reg-panel--active' : 'reg-panel--inactive'}`}
          onClick={tipo !== 'empresa' ? () => switchTo('empresa') : undefined}
        >
          {tipo !== 'empresa' ? (
            <div className="reg-teaser">
              <Building2 size={40} className="reg-teaser-icon" />
              <h2>Empresa / Servicio</h2>
              <p>Crea tu cuenta como proveedor</p>
              <span className="reg-teaser-cta">Regístrate aquí →</span>
            </div>
          ) : (
            <div className="reg-form-wrap">
              <h2 className="reg-form-title"><Building2 size={20} /> Crear cuenta empresa</h2>
              <p className="reg-form-sub">Registro de servicio / proveedor</p>

              {errorEmpresa && <div className="reg-error">{errorEmpresa}</div>}

              <Form onSubmit={handleEmpresa}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la empresa</Form.Label>
                  <Form.Control
                    placeholder="Ej: Clínica VetCare"
                    value={empresa.empresa}
                    onChange={e => campoEmpresa('empresa', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Rubro</Form.Label>
                  <Form.Select
                    value={empresa.rubro}
                    onChange={e => campoEmpresa('rubro', e.target.value)}
                  >
                    {RUBROS.map(r => (
                      <option key={r.tipoServicio} value={r.tipoServicio}>
                        {r.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>RUT empresa</Form.Label>
                  <Form.Control
                    placeholder="12345678-9"
                    value={empresa.rut}
                    onChange={e => campoEmpresa('rut', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    placeholder="Av. Ejemplo 1234"
                    value={empresa.direccion}
                    onChange={e => campoEmpresa('direccion', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Comuna</Form.Label>
                  <Form.Select
                    value={empresa.comuna}
                    onChange={e => campoEmpresa('comuna', e.target.value)}
                  >
                    <option value="">Selecciona una comuna</option>
                    {COMUNAS_LISTA.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="+56 2 1234 5678"
                    value={empresa.telefono}
                    onChange={e => campoEmpresa('telefono', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="empresa@correo.com"
                    value={empresa.email}
                    onChange={e => campoEmpresa('email', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={empresa.password}
                    onChange={e => campoEmpresa('password', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={empresa.confirm}
                    onChange={e => campoEmpresa('confirm', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="terminos"
                    label="Acepto los términos y condiciones de uso"
                    checked={empresa.terminos}
                    onChange={e => campoEmpresa('terminos', e.target.checked)}
                  />
                </Form.Group>

                <button
                  type="submit"
                  className="reg-btn reg-btn--empresa"
                  disabled={loadingEmpresa}
                >
                  {loadingEmpresa ? 'Registrando...' : 'Registrar empresa'}
                </button>

                <div className="reg-login-link">
                  <span className="text-muted">¿Ya tienes cuenta? </span>
                  <Link to="/login-empresa">Inicia sesión aquí</Link>
                </div>
              </Form>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default Register;