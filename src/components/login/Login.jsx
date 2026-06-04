import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import AuthNavbar from '../navbar/AuthNavbar';
import api, { ApiError } from '../../api/petdate-api';
import { Building2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Login → guarda el JWT en localStorage automáticamente
      await api.auth.login(email, password);

      // 2. Obtener datos completos del usuario (id, nombre, etc.)
      const usuario = await api.usuarios.porCorreo(email);

      // 3. Guardar datos del usuario para la UI
      localStorage.setItem('user', JSON.stringify({
        id:    usuario.id,
        email: usuario.correo,
        name:  usuario.nombre,
        role:  'cliente',
      }));

      window.dispatchEvent(new Event('userChanged'));

      // 4. Redirigir a mis mascotas
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
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh', paddingTop: '70px' }}
      >
        <Row className="w-100">
          <Col md={6} lg={4} className="mx-auto">
            <Card className="shadow">
              <Card.Body className="p-5">
                <h2 className="text-center mb-4">Iniciar Sesión</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </Button>

                  <div className="text-center">
                    <span className="text-muted">¿No tienes cuenta? </span>
                    <Link to="/register" className="text-decoration-none">
                      Regístrate aquí
                    </Link>
                  </div>

                  <hr className="my-3" />

                  <div className="text-center">
                    <Link
                      to="/login-empresa"
                      className="text-decoration-none"
                      style={{ color: '#7e6492', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                      <Building2 size={16} /> ¿Eres empresa? Inicia sesión aquí
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

export default Login;