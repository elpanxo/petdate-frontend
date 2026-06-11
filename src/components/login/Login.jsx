import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Briefcase, PawPrint, Heart} from 'lucide-react';
import AuthNavbar from '../navbar/AuthNavbar';
import catAndDog from '../../assets/roots/cat-and-dog.png';
import api, { ApiError, token } from '../../api/petdate-api';
import './Login.css';

const Login = () => {
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
      await api.auth.login(email, password);
      const claims = token.payload();
      if (!claims?.id) throw new Error('No se pudo leer la sesión');
      const usuario = await api.usuarios.porId(claims.id);
      localStorage.setItem('user', JSON.stringify({
        id:    usuario.id,
        email: usuario.correo,
        name:  usuario.nombre,
        role:  'cliente',
      }));
      window.dispatchEvent(new Event('userChanged'));
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError('Correo o contraseña incorrectos');
        else if (err.status === 0) setError('Error de conexión. Verifica que el servidor esté activo.');
        else setError(err.message || 'Error al iniciar sesión');
      } else {
        setError('Error inesperado. Intenta de nuevo.');
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

        {/* ── Derecha: formulario ── */}
        <div className="login-right">
          <div className="login-card">

            <h1 className="login-card__title">Iniciar Sesión</h1>
            <p className="login-card__sub">Ingresa tus datos para continuar</p>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">

              <div className="login-field">
                <label className="login-label">Correo electrónico</label>
                <div className="login-input-wrap">
                  <Mail size={16} className="login-input-icon" />
                  <input
                    type="email"
                    className="login-input"
                    placeholder="ejemplo@correo.com"
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

              {/* Solo muestra Empresa — el usuario es el default */}
              <Link to="/login-empresa" className="login-mode-btn">
                <Briefcase size={16} />
                <span>Empresa / Negocio</span>
              </Link>

              <p className="login-register-link">
                ¿No tienes cuenta?{' '}
                <Link to="/register">Regístrate aquí</Link>
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

export default Login;