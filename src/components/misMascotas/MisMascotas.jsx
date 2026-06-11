import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';
import api, { ApiError, BASE_URL, token } from '../../api/petdate-api';
import { Dog, Cat, Bird, Rabbit, Turtle, Fish, PawPrint, Hourglass, TriangleAlert, Pencil, Trash2 } from 'lucide-react';
import './MisMascotas.css';

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────
const TIPOS_MASCOTA = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Pez', 'Otro'];

// El backend usa "especie" — mapeamos el tipo del formulario a ese campo
const ICON_TIPO = {
  Perro: Dog, Gato: Cat, Ave: Bird, Conejo: Rabbit,
  Reptil: Turtle, Pez: Fish, Otro: PawPrint,
};

const FORM_INICIAL = {
  nombre: '',
  tipo: 'Perro',       // → especie en el backend
  raza: '',
  edad: '',
  sexo: 'Macho',
  peso: '',
  fechaNacimiento: '', // → fecha_nacimineto en el backend
  color: '',
  observaciones: '',
  infoMedica: '',      // → info_medica_basica en el backend
  imagen: '',
};

// ─────────────────────────────────────────────
// Helpers de mapeo frontend ↔ backend
// ─────────────────────────────────────────────

/** Convierte el form local al body que espera POST/PUT /mascotas */
function formToRequest(form, usuarioId) {
  return {
    nombre:            form.nombre,
    especie:           form.tipo,
    raza:              form.raza || 'Sin especificar',
    edad:              Number(form.edad) || 0,
    sexo:              form.sexo,
    tamano:            'Mediano',          // valor por defecto — puedes agregar el campo al form
    peso:              parseFloat(form.peso) || 0,
    fecha_nacimineto:  form.fechaNacimiento || null,
    color:             form.color || '',
    observaciones:     form.observaciones || '',
    info_medica_basica: form.infoMedica || '',
    usuarioId,
  };
}

/** Convierte la respuesta del backend al estado local del form */
function responseToForm(mascota) {
  return {
    nombre:          mascota.nombre,
    tipo:            mascota.especie,
    raza:            mascota.raza,
    edad:            String(mascota.edad),
    sexo:            mascota.sexo,
    peso:            String(mascota.peso),
    fechaNacimiento: mascota.fecha_nacimineto
      ? mascota.fecha_nacimineto.slice(0, 10)   // ISO → 'YYYY-MM-DD'
      : '',
    color:           mascota.color || '',
    observaciones:   mascota.observaciones || '',
    infoMedica:      mascota.info_medica_basica || '',
  };
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────
function MisMascotas() {
  const navigate = useNavigate();

  // Usuario logueado (guardado en localStorage al hacer login/registro)
  const [usuario, setUsuario] = useState(null);

  // Lista de mascotas
  const [mascotas, setMascotas]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Modal
  const [showModal, setShowModal]   = useState(false);
  const [editandoId, setEditandoId] = useState(null);   // id del backend (number)
  const [form, setForm]             = useState(FORM_INICIAL);
  const [errNombre, setErrNombre]   = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // ── Verificar sesión y cargar mascotas al montar ──
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }

    const user = JSON.parse(userData);
    if (!user.id) { navigate('/login'); return; }

    setUsuario(user);
    cargarMascotas(user.id);
  }, []);

  // ── Cargar mascotas del usuario desde el backend ──
  const cargarMascotas = useCallback(async (usuarioId) => {
    setLoading(true);
    setError('');
    try {
      const page = await api.mascotas.porUsuario(usuarioId, { size: 100 });
      setMascotas(page.content);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login');
      } else {
        setError('No se pudieron cargar las mascotas. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ── Abrir modal agregar ──
  const abrirAgregar = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErrNombre(false);
    setErrorModal('');
    setShowModal(true);
  };

  // ── Abrir modal editar ──
  const abrirEditar = (mascota, e) => {
    e.stopPropagation();
    setEditandoId(mascota.id);
    setForm(responseToForm(mascota));
    setErrNombre(false);
    setErrorModal('');
    setShowModal(true);
  };

  // ── Eliminar mascota ──
  const eliminar = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que quieres eliminar esta mascota?')) return;
    try {
      await api.mascotas.eliminar(id);
      setMascotas(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('No se pudo eliminar la mascota. Intenta de nuevo.');
    }
  };

  // ── Preview imagen (solo para mostrar antes de subir; el backend la persiste) ──
  const handleImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Guardamos el archivo temporalmente y lo subimos al backend al guardar
    setForm(prev => ({ ...prev, _imagenFile: file }));

    // Preview local (solo para esta sesión, no se persiste en localStorage)
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, imagen: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // ── Guardar (crear o actualizar) ──
  const guardar = async () => {
    if (!form.nombre.trim()) { setErrNombre(true); return; }
    setGuardando(true);
    setErrorModal('');

    try {
      const body = formToRequest(form, usuario.id);
      let mascotaGuardada;

      if (editandoId) {
        mascotaGuardada = await api.mascotas.actualizar(editandoId, body);
        setMascotas(prev => prev.map(m => m.id === editandoId ? mascotaGuardada : m));
      } else {
        mascotaGuardada = await api.mascotas.crear(body);
        setMascotas(prev => [...prev, mascotaGuardada]);
      }

      // Subir imagen si el usuario seleccionó una
      if (form._imagenFile) {
        const formData = new FormData();
        formData.append('imagen', form._imagenFile);

        const response = await fetch(
          `${BASE_URL}/mascotas/${mascotaGuardada.id}/imagen`,
          {
            method: 'POST',
            headers: token.exists() ? { Authorization: `Bearer ${token.get()}` } : {},
            body: formData,  // NO pongas Content-Type — el browser lo setea solo con el boundary
          }
        );
        const mascotaConImagen = await response.json();
        setMascotas(prev => prev.map(m =>
          m.id === mascotaGuardada.id ? mascotaConImagen : m
        ));
      }

      setShowModal(false);
    } catch (err) {
      setErrorModal('Error al guardar la mascota.');
    } finally {
      setGuardando(false);
    }
  };

  const campo = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="mm-page">

        <div className="mm-header">
          <div>
            <h1 className="mm-titulo"><PawPrint size={22} /> Mis Mascotas</h1>
            <p className="mm-subtitulo">Gestiona el perfil y la agenda de tus compañeros</p>
          </div>
          <button className="mm-btn-agregar" onClick={abrirAgregar}>+ Agregar Mascota</button>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="mm-empty">
            <div className="mm-empty-icon"><Hourglass size={32} /></div>
            <h3>Cargando mascotas...</h3>
          </div>
        )}

        {/* Error de carga */}
        {!loading && error && (
          <div className="mm-empty">
            <div className="mm-empty-icon"><TriangleAlert size={32} /></div>
            <h3>{error}</h3>
            <button className="mm-btn-agregar" onClick={() => cargarMascotas(usuario?.id)}>
              Reintentar
            </button>
          </div>
        )}

        {/* Sin mascotas */}
        {!loading && !error && mascotas.length === 0 && (
          <div className="mm-empty">
            <div className="mm-empty-icon"><PawPrint size={32} /></div>
            <h3>Aún no tienes mascotas registradas</h3>
            <p>Agrega tu primera mascota para empezar a gestionar su perfil y agenda</p>
            <button className="mm-btn-agregar" onClick={abrirAgregar}>+ Agregar mi primera mascota</button>
          </div>
        )}

        {/* Grid de mascotas */}
        {!loading && !error && mascotas.length > 0 && (
          <div className="mm-grid">
            {mascotas.map(m => (
              <div
                className="mm-card"
                key={m.id}
                onClick={() => navigate(`/mis-mascotas/${m.id}`)}
              >
                <div className="mm-card-img">
                  {m.imagenUrl
                    ? <img src={`${BASE_URL}${m.imagenUrl}`} alt={m.nombre} className="mm-card-foto" />
                    : (() => {
                        const IconoTipo = ICON_TIPO[m.especie] || PawPrint;
                        return <IconoTipo className="mm-card-emoji" size={40} />;
                      })()
                  }
                </div>
                <div className="mm-card-body">
                  <h3 className="mm-card-nombre">{m.nombre}</h3>
                  <p className="mm-card-tipo">{m.especie}{m.raza ? ` · ${m.raza}` : ''}</p>
                  {m.edad > 0 && (
                    <p className="mm-card-edad">{m.edad} {m.edad === 1 ? 'año' : 'años'}</p>
                  )}
                </div>
                <div className="mm-card-actions">
                  <button className="mm-btn-edit"   onClick={(e) => abrirEditar(m, e)}><Pencil size={14} /> Editar</button>
                  <button className="mm-btn-delete" onClick={(e) => eliminar(m.id, e)}><Trash2 size={14} /> Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Modal agregar / editar ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editandoId ? 'Editar mascota' : 'Agregar mascota'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorModal && (
            <div className="alert alert-danger" role="alert">{errorModal}</div>
          )}
          <Form>
            <div className="mm-form-grid">

              <Form.Group className="mm-form-full">
                <Form.Label>Foto de la mascota</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImagen} />
                {form.imagen && (
                  <img src={form.imagen} alt="preview" className="mm-img-preview" />
                )}
                <Form.Text className="text-muted">
                  La foto se guarda en el servidor y estará disponible en cualquier dispositivo.
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={form.nombre}
                  isInvalid={errNombre}
                  onChange={e => { campo('nombre', e.target.value); setErrNombre(false); }}
                />
                {errNombre && <Form.Text className="text-danger">El nombre es obligatorio</Form.Text>}
              </Form.Group>

              <Form.Group>
                <Form.Label>Tipo de mascota</Form.Label>
                <Form.Select value={form.tipo} onChange={e => campo('tipo', e.target.value)}>
                  {TIPOS_MASCOTA.map(t => <option key={t}>{t}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Raza</Form.Label>
                <Form.Control value={form.raza} onChange={e => campo('raza', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Edad (años)</Form.Label>
                <Form.Control
                  type="number" min="0" max="50"
                  value={form.edad}
                  onChange={e => campo('edad', e.target.value)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Sexo</Form.Label>
                <Form.Select value={form.sexo} onChange={e => campo('sexo', e.target.value)}>
                  <option>Macho</option>
                  <option>Hembra</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Peso (kg)</Form.Label>
                <Form.Control
                  type="number" step="0.1" min="0"
                  value={form.peso}
                  onChange={e => campo('peso', e.target.value)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Fecha de nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={e => campo('fechaNacimiento', e.target.value)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Color</Form.Label>
                <Form.Control value={form.color} onChange={e => campo('color', e.target.value)} />
              </Form.Group>

              <Form.Group className="mm-form-full">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  value={form.observaciones}
                  onChange={e => campo('observaciones', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mm-form-full">
                <Form.Label>Información médica básica</Form.Label>
                <Form.Control
                  as="textarea" rows={2}
                  value={form.infoMedica}
                  onChange={e => campo('infoMedica', e.target.value)}
                />
              </Form.Group>

            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            style={{ backgroundColor: '#7e6492', border: 'none' }}
            onClick={guardar}
            disabled={guardando}
          >
            {guardando
              ? (editandoId ? 'Guardando...' : 'Agregando...')
              : (editandoId ? 'Guardar cambios' : 'Agregar mascota')
            }
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
}

export default MisMascotas;