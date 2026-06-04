import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';
import { TIPO_COLOR, COMUNAS } from '../servicios/serviciosData';
import { Building2, ClipboardList, CheckCircle2, Tag, Pencil, Trash2 } from 'lucide-react';
import api, { ApiError } from '../../api/petdate-api';
import './MiEmpresa.css';

const COMUNAS_LISTA = COMUNAS.filter(c => c !== 'Todas');

const RUBROS_EMPRESA = [
  { label: 'Veterinaria',                  valor: 'Veterinaria' },
  { label: 'Veterinaria 24/7',             valor: 'Veterinaria 24/7' },
  { label: 'Servicios (Peluquería / Spa)', valor: 'Peluquería / Spa' },
  { label: 'Tienda de mascotas',           valor: 'Tienda de mascotas' },
];

function MiEmpresa() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user || user.role !== 'empresa') navigate('/');
  }, []);

  const [cargando, setCargando]       = useState(true);
  const [errorCarga, setErrorCarga]   = useState('');
  const [formServicio, setFormServicio] = useState({
    nombre: '', tipo: '', descripcion: '', direccion: '',
    comuna: '', horario: '', telefono: '', wsp: '', web: '',
    instagram: '', facebook: '',
  });
  const [guardado, setGuardado]             = useState(false);
  const [guardando, setGuardando]           = useState(false);

  const [promociones, setPromociones]       = useState([]);
  const [showModal, setShowModal]           = useState(false);
  const [editandoPromoId, setEditandoPromoId] = useState(null);
  const [formPromo, setFormPromo]           = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaTermino: '' });
  const [errPromo, setErrPromo]             = useState({});
  const [guardandoPromo, setGuardandoPromo] = useState(false);

  useEffect(() => {
    if (!user?.servicioId) return;
    const cargar = async () => {
      try {
        const [svc, promos] = await Promise.all([
          api.servicios.porId(user.servicioId),
          api.promociones.porServicio(user.servicioId, { size: 100 }),
        ]);
        setFormServicio({
          nombre:      svc.nombreServicio || '',
          tipo:        svc.tipoServicio   || '',
          descripcion: svc.descripcion    || '',
          direccion:   svc.direccion      || '',
          comuna:      svc.comuna         || '',
          horario:     svc.horario        || '',
          telefono:    svc.telefono       || '',
          wsp:         svc.whatsApp       || '',
          web:         svc.sitioWeb       || '',
          instagram:   svc.instagram      || '',
          facebook:    svc.facebook       || '',
        });
        setPromociones(promos.content || []);
      } catch {
        setErrorCarga('No se pudo cargar la información de tu empresa.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const campo = (field, value) => setFormServicio(prev => ({ ...prev, [field]: value }));

  const guardarServicio = async () => {
    setGuardando(true);
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      await api.servicios.actualizar(u.servicioId, {
        nombreServicio: formServicio.nombre,
        tipoServicio:   formServicio.tipo,
        rutEmpresa:     u.rut        || '',
        correo:         u.email      || '',
        contrasena:     u.contrasena || '',
        descripcion:    formServicio.descripcion,
        direccion:      formServicio.direccion,
        comuna:         formServicio.comuna,
        horario:        formServicio.horario,
        telefono:       formServicio.telefono,
        whatsApp:       formServicio.wsp,
        sitioWeb:       formServicio.web,
        instagram:      formServicio.instagram,
        facebook:       formServicio.facebook,
      });
      u.name = formServicio.nombre;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('userChanged'));
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch {
      alert('Error al guardar los cambios. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  const recargarPromociones = async () => {
    const promos = await api.promociones.porServicio(user.servicioId, { size: 100 });
    setPromociones(promos.content || []);
  };

  const abrirAgregarPromo = () => {
    setEditandoPromoId(null);
    setFormPromo({ titulo: '', descripcion: '', fechaInicio: '', fechaTermino: '' });
    setErrPromo({});
    setShowModal(true);
  };

  const abrirEditarPromo = (promo) => {
    setEditandoPromoId(promo.idPromocion);
    setFormPromo({
      titulo:       promo.titulo       || '',
      descripcion:  promo.descripcion  || '',
      fechaInicio:  promo.fechaInicio  || '',
      fechaTermino: promo.fechaTermino || '',
    });
    setErrPromo({});
    setShowModal(true);
  };

  const eliminarPromo = async (promoId) => {
    if (!window.confirm('¿Eliminar esta promoción?')) return;
    try {
      await api.promociones.eliminar(promoId);
      await recargarPromociones();
    } catch {
      alert('Error al eliminar la promoción.');
    }
  };

  const validarPromo = () => {
    const errs = {};
    if (!formPromo.titulo.trim())       errs.titulo       = 'El título es obligatorio';
    if (!formPromo.fechaInicio)         errs.fechaInicio  = 'La fecha de inicio es obligatoria';
    if (!formPromo.fechaTermino)        errs.fechaTermino = 'La fecha de término es obligatoria';
    if (formPromo.fechaInicio && formPromo.fechaTermino && formPromo.fechaTermino < formPromo.fechaInicio)
      errs.fechaTermino = 'La fecha de término debe ser posterior al inicio';
    return errs;
  };

  const guardarPromo = async () => {
    const errs = validarPromo();
    if (Object.keys(errs).length) { setErrPromo(errs); return; }
    setGuardandoPromo(true);
    try {
      const payload = {
        idServicio:   user.servicioId,
        titulo:       formPromo.titulo,
        descripcion:  formPromo.descripcion,
        fechaInicio:  formPromo.fechaInicio,
        fechaTermino: formPromo.fechaTermino,
      };
      if (editandoPromoId) {
        await api.promociones.actualizar(editandoPromoId, payload);
      } else {
        await api.promociones.crear(payload);
      }
      await recargarPromociones();
      setShowModal(false);
    } catch {
      alert('Error al guardar la promoción. Intenta nuevamente.');
    } finally {
      setGuardandoPromo(false);
    }
  };

  const color = TIPO_COLOR[formServicio.tipo] || '#7e6492';

  if (cargando) return (
    <>
      <Navbar />
      <div className="me-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p className="text-muted">Cargando información de tu empresa...</p>
      </div>
      <Footer />
    </>
  );

  if (errorCarga) return (
    <>
      <Navbar />
      <div className="me-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p className="text-danger">{errorCarga}</p>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="me-page">

        <div className="me-header">
          <div>
            <h1 className="me-titulo"><Building2 size={22} /> Mi Empresa</h1>
            <p className="me-subtitulo">Gestiona la información y promociones de tu servicio</p>
          </div>
        </div>

        {/* Sección: información del servicio */}
        <div className="me-seccion">
          <div className="me-seccion-header">
            <h2><ClipboardList size={18} /> Información del servicio</h2>
            <div className="me-acciones">
              {guardado && <span className="me-guardado-msg"><CheckCircle2 size={16} /> Guardado</span>}
              <button className="me-btn-primary" onClick={guardarServicio} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          <Form>
            <div className="me-form-grid">

              <Form.Group>
                <Form.Label>Nombre del servicio</Form.Label>
                <Form.Control value={formServicio.nombre} onChange={e => campo('nombre', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Tipo</Form.Label>
                <Form.Select value={formServicio.tipo} onChange={e => campo('tipo', e.target.value)}>
                  {RUBROS_EMPRESA.map(r => (
                    <option key={r.valor} value={r.valor}>{r.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="me-form-full">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={3} value={formServicio.descripcion} onChange={e => campo('descripcion', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control value={formServicio.direccion} onChange={e => campo('direccion', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Comuna</Form.Label>
                <Form.Select value={formServicio.comuna} onChange={e => campo('comuna', e.target.value)}>
                  <option value="">Selecciona una comuna</option>
                  {COMUNAS_LISTA.map(c => <option key={c}>{c}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Horario</Form.Label>
                <Form.Control value={formServicio.horario} onChange={e => campo('horario', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control value={formServicio.telefono} onChange={e => campo('telefono', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>WhatsApp (solo números, sin +)</Form.Label>
                <Form.Control value={formServicio.wsp} onChange={e => campo('wsp', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Sitio web</Form.Label>
                <Form.Control value={formServicio.web} onChange={e => campo('web', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Instagram (sin @)</Form.Label>
                <Form.Control value={formServicio.instagram} onChange={e => campo('instagram', e.target.value)} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Facebook</Form.Label>
                <Form.Control value={formServicio.facebook} onChange={e => campo('facebook', e.target.value)} />
              </Form.Group>

            </div>
          </Form>
        </div>

        {/* Sección: promociones */}
        <div className="me-seccion">
          <div className="me-seccion-header">
            <h2><Tag size={18} /> Promociones</h2>
            <button className="me-btn-primary" onClick={abrirAgregarPromo}>+ Agregar promoción</button>
          </div>

          {promociones.length === 0 ? (
            <div className="me-promos-empty">
              <Tag size={24} />
              <p>No tienes promociones activas.</p>
              <p>¡Agrega una para atraer más clientes!</p>
            </div>
          ) : (
            <div className="me-promos-lista">
              {promociones.map(promo => (
                <div className="me-promo-card" key={promo.idPromocion} style={{ borderLeftColor: color }}>
                  <div className="me-promo-info">
                    <h3>{promo.titulo}</h3>
                    {promo.descripcion && <p>{promo.descripcion}</p>}
                    <small className="text-muted">
                      {promo.fechaInicio} → {promo.fechaTermino}
                    </small>
                  </div>
                  <div className="me-promo-actions">
                    <button className="me-promo-btn-edit" onClick={() => abrirEditarPromo(promo)}><Pencil size={14} /> Editar</button>
                    <button className="me-promo-btn-delete" onClick={() => eliminarPromo(promo.idPromocion)}><Trash2 size={14} /> Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal promoción */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editandoPromoId ? 'Editar promoción' : 'Agregar promoción'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título <span className="text-danger">*</span></Form.Label>
              <Form.Control
                isInvalid={!!errPromo.titulo}
                value={formPromo.titulo}
                placeholder="Ej: 20% en consultas este mes"
                onChange={e => { setFormPromo(p => ({ ...p, titulo: e.target.value })); setErrPromo(p => ({ ...p, titulo: '' })); }}
              />
              {errPromo.titulo && <Form.Text className="text-danger">{errPromo.titulo}</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formPromo.descripcion}
                placeholder="Describe los detalles y condiciones"
                onChange={e => setFormPromo(p => ({ ...p, descripcion: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de inicio <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                isInvalid={!!errPromo.fechaInicio}
                value={formPromo.fechaInicio}
                onChange={e => { setFormPromo(p => ({ ...p, fechaInicio: e.target.value })); setErrPromo(p => ({ ...p, fechaInicio: '' })); }}
              />
              {errPromo.fechaInicio && <Form.Text className="text-danger">{errPromo.fechaInicio}</Form.Text>}
            </Form.Group>
            <Form.Group>
              <Form.Label>Fecha de término <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                isInvalid={!!errPromo.fechaTermino}
                value={formPromo.fechaTermino}
                onChange={e => { setFormPromo(p => ({ ...p, fechaTermino: e.target.value })); setErrPromo(p => ({ ...p, fechaTermino: '' })); }}
              />
              {errPromo.fechaTermino && <Form.Text className="text-danger">{errPromo.fechaTermino}</Form.Text>}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button style={{ backgroundColor: '#7e6492', border: 'none' }} onClick={guardarPromo} disabled={guardandoPromo}>
            {guardandoPromo ? 'Guardando...' : editandoPromoId ? 'Guardar cambios' : 'Agregar promoción'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
}

export default MiEmpresa;
