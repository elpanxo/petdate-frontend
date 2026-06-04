import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import AuthNavbar from '../navbar/AuthNavbar';
import { Building2 } from 'lucide-react';
import api, { ApiError } from '../../api/petdate-api';

function decodeJwtPayload(jwtToken) {
  const payload = jwtToken.split('.')[1];
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

const LoginEmpresa = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.auth.loginEmpresa(email, password);
      const payload = decodeJwtPayload(token);
      const servicioId = payload.id;

      const servicio = await api.servicios.porId(servicioId);

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
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '70px' }}>
        <Row className="w-100">
          <Col md={6} lg={4} className="mx-auto">
            <Card className="shadow">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <Building2 size={40} />
                  <h2 className="mt-2 mb-0">Iniciar Sesión</h2>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Cuenta empresa / servicio</p>
                </div>

                {error && (
                  <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>
                    {error}
                  </div>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="empresa@correo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 mb-3"
                    style={{ backgroundColor: '#7e6492', border: 'none', fontWeight: 600 }}
                    disabled={loading}
                  >
                    {loading ? 'Ingresando...' : 'Ingresar como empresa'}
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none text-muted" style={{ fontSize: '0.9rem' }}>
                      ← Volver al inicio de sesión de usuario
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LoginEmpresa;
