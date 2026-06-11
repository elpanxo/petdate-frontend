import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, PawPrint, Heart } from 'lucide-react';
import AuthNavbar from '../navbar/AuthNavbar';
import catAndDog from '../../assets/roots/cat-and-dog.png';
import api, { ApiError } from '../../api/petdate-api';
import './Login.css';

function decodeJwtPayload(jwtToken) {
  const payload = jwtToken.split('.')[1];
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

const LoginEmpresa = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.auth.loginEmpresa(email, password);
      const payload   = decodeJwtPayload(token);
      const servicioId = payload.id;
      const servicio   = await api.servicios.porId(servicioId);
      localStorage.setItem('user', JSON.stringify({
        id:         servicioId,
        email:      servicio.correo,
        name:       servicio.nombreServicio,
        role:       'empresa',
        servicioId: servicioId,
        rut:        servicio.rutEmpresa,
        contrasena: password,
      }));
      window.dispatchEvent(new Event('userChanged'));
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError('Correo o contraseña incorrectos');
        else setError(err.message || 'Error al iniciar sesión');
      } else {
        setError('Error de conexión. Verifica que el servidor esté activo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthNavbar />
      <div className="login-page">

        {/* ── Izquierda: ilustración ── */}
        <div className="login-left">
          <div className="login-left__text">
            <h2 className="login-left__title">
              Todo lo que tu mascota<br />necesita, en un solo lugar. <Heart size={28} style={{ display: 'inline', verticalAlign: 'middle', color: '#e07b54', fill: '#e07b54' }} />
            </h2>
            <p className="login-left__sub">
              Conectamos dueños y empresas de confianza<br />
              para el mejor cuidado de tu mascota <PawPrint size={16} style={{ display: 'inline',verticalAlign: 'middle' }} />
              </p>
          </div>
          <div className="login-left__illo">
            <img src={catAndDog} alt="Perro y gato" className="login-left__img" />
          </div>
        </div>

        {/* ── Derecha: formulario empresa ── */}
        <div className="login-right">
          <div className="login-card">

            <h1 className="login-card__title">Iniciar Sesión</h1>
            <p className="login-card__sub">Cuenta empresa / negocio</p>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">

              <div className="login-field">
                <label className="login-label">Correo electrónico</label>
                <div className="login-input-wrap">
                  <Mail size={16} className="login-input-icon" />
                  <input
                    type="email"
                    className="login-input"
                    placeholder="empresa@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Contraseña</label>
                <div className="login-input-wrap">
                  <Lock size={16} className="login-input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="login-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-input-toggle"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn-primary" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>

              <div className="login-separator"><span>o</span></div>
              <p className="login-switch-label">Ingresa como</p>

              {/* Solo muestra Dueño de mascota — para volver al login normal */}
              <Link to="/login" className="login-mode-btn login-mode-btn--user">
                <PawPrint size={16} />
                <span>Dueño de mascota</span>
              </Link>

              <p className="login-register-link">
                ¿Eres empresa?{' '}
                <Link to="/register">Registra tu negocio aquí</Link>
              </p>

            </form>
          </div>
        </div>
      </div>

      <div className="login-footer">
        <span>Hecho con <Heart size={14} /> para las mascotas de Chile</span>
      </div>
    </>
  );
};

export default LoginEmpresa;