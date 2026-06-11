import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';
import { TIPO_COLOR, COMUNAS } from '../servicios/serviciosData';
import { Building2, ClipboardList, CheckCircle2, Tag, Pencil, Trash2, Image as ImageIcon, Newspaper } from 'lucide-react';
import api, { ApiError, BASE_URL } from '../../api/petdate-api';
import './MiEmpresa.css';

const COMUNAS_LISTA = COMUNAS.filter(c => c !== 'Todas');

const RUBROS_EMPRESA = [
  { label: 'Veterinaria',                  valor: 'Veterinaria' },
  { label: 'Veterinaria 24/7',             valor: 'Veterinaria 24/7' },
  { label: 'Servicios (Peluquería / Spa)', valor: 'Peluquería / Spa' },
  { label: 'Tienda de mascotas',           valor: 'Tienda de mascotas' },
];

// Restricciones de la imagen del servicio (validación en el cliente —
// el backend no valida tipo/tamaño, así que esto es solo una primera barrera de UX)
const TIPOS_IMAGEN_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAX_MB = 5;

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

  // ── Imagen / logo del servicio ──────────────────────────────────────────
  const [imagenUrl, setImagenUrl]           = useState('');
  const [imagenPreview, setImagenPreview]   = useState(null);
  const [archivoImagen, setArchivoImagen]   = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen]       = useState('');

  const [promociones, setPromociones]       = useState([]);
  const [showModal, setShowModal]           = useState(false);
  const [editandoPromoId, setEditandoPromoId] = useState(null);
  const [formPromo, setFormPromo]           = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaTermino: '' });
  const [errPromo, setErrPromo]             = useState({});
  const [guardandoPromo, setGuardandoPromo] = useState(false);

  // ── Blog ─────────────────────────────────────────────────────────────────
  const [blogs, setBlogs]                       = useState([]);
  const [showModalBlog, setShowModalBlog]       = useState(false);
  const [editandoBlogId, setEditandoBlogId]     = useState(null);
  const [formBlog, setFormBlog]                 = useState({ titulo: '', texto: '' });
  const [errBlog, setErrBlog]                   = useState({});
  const [guardandoBlog, setGuardandoBlog]       = useState(false);
  const [imagenActualBlog, setImagenActualBlog] = useState('');
  const [archivoImagenBlog, setArchivoImagenBlog] = useState(null);
  const [imagenPreviewBlog, setImagenPreviewBlog] = useState(null);
  const [errorImagenBlog, setErrorImagenBlog]   = useState('');

  useEffect(() => {
    if (!user?.servicioId) return;
    const cargar = async () => {
      try {
        const [svc, promos, entradasBlog] = await Promise.all([
          api.servicios.porId(user.servicioId),
          api.promociones.porServicio(user.servicioId, { size: 100 }),
          api.blogs.porServicio(user.servicioId, { size: 100, sort: 'fecha,desc' }),
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
        setImagenUrl(svc.imagenUrl || '');
        setPromociones(promos.content || []);
        setBlogs(entradasBlog.content || []);
      } catch {
        setErrorCarga('No se pudo cargar la información de tu empresa.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Limpia el object URL del preview al reemplazarlo o desmontar (evita fugas de memoria)
  useEffect(() => {
    return () => { if (imagenPreview) URL.revokeObjectURL(imagenPreview); };
  }, [imagenPreview]);

  useEffect(() => {
    return () => { if (imagenPreviewBlog) URL.revokeObjectURL(imagenPreviewBlog); };
  }, [imagenPreviewBlog]);

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

  // ── Handlers de imagen ───────────────────────────────────────────────────

  const seleccionarImagen = (e) => {
    const archivo = e.target.files?.[0];
    setErrorImagen('');
    if (!archivo) return;

    if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
      setErrorImagen('Formato no permitido. Usa JPG, PNG o WEBP.');
      e.target.value = '';
      return;
    }
    if (archivo.size > TAMANO_MAX_MB * 1024 * 1024) {
      setErrorImagen(`La imagen no puede superar los ${TAMANO_MAX_MB} MB.`);
      e.target.value = '';
      return;
    }

    setArchivoImagen(archivo);
    setImagenPreview(URL.createObjectURL(archivo));
  };

  const subirImagen = async () => {
    if (!archivoImagen || !user?.servicioId) return;
    setSubiendoImagen(true);
    setErrorImagen('');
    try {
      const actualizado = await api.servicios.subirImagen(user.servicioId, archivoImagen);
      setImagenUrl(actualizado.imagenUrl || '');
      setArchivoImagen(null);
      setImagenPreview(null);
    } catch {
      setErrorImagen('No se pudo subir la imagen. Intenta nuevamente.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const cancelarSeleccionImagen = () => {
    setArchivoImagen(null);
    setImagenPreview(null);
    setErrorImagen('');
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

  // ── Blog: handlers ───────────────────────────────────────────────────────

  const recargarBlogs = async () => {
    const data = await api.blogs.porServicio(user.servicioId, { size: 100, sort: 'fecha,desc' });
    setBlogs(data.content || []);
  };

  const limpiarSeleccionImagenBlog = () => {
    if (imagenPreviewBlog) URL.revokeObjectURL(imagenPreviewBlog);
    setArchivoImagenBlog(null);
    setImagenPreviewBlog(null);
    setErrorImagenBlog('');
  };

  const abrirAgregarBlog = () => {
    setEditandoBlogId(null);
    setFormBlog({ titulo: '', texto: '' });
    setErrBlog({});
    setImagenActualBlog('');
    limpiarSeleccionImagenBlog();
    setShowModalBlog(true);
  };

  const abrirEditarBlog = (blog) => {
    setEditandoBlogId(blog.idBlog);
    setFormBlog({ titulo: blog.titulo || '', texto: blog.texto || '' });
    setErrBlog({});
    setImagenActualBlog(blog.imagen || '');
    limpiarSeleccionImagenBlog();
    setShowModalBlog(true);
  };

  const eliminarBlog = async (idBlog) => {
    if (!window.confirm('¿Eliminar esta entrada de blog?')) return;
    try {
      await api.blogs.eliminar(idBlog);
      await recargarBlogs();
    } catch {
      alert('Error al eliminar la entrada de blog.');
    }
  };

  const seleccionarImagenBlog = (e) => {
    const archivo = e.target.files?.[0];
    setErrorImagenBlog('');
    if (!archivo) return;

    if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
      setErrorImagenBlog('Formato no permitido. Usa JPG, PNG o WEBP.');
      e.target.value = '';
      return;
    }
    if (archivo.size > TAMANO_MAX_MB * 1024 * 1024) {
      setErrorImagenBlog(`La imagen no puede superar los ${TAMANO_MAX_MB} MB.`);
      e.target.value = '';
      return;
    }

    if (imagenPreviewBlog) URL.revokeObjectURL(imagenPreviewBlog);
    setArchivoImagenBlog(archivo);
    setImagenPreviewBlog(URL.createObjectURL(archivo));
  };

  const validarBlog = () => {
    const errs = {};
    if (!formBlog.titulo.trim()) errs.titulo = 'El título es obligatorio';
    if (!formBlog.texto.trim())  errs.texto  = 'El contenido es obligatorio';
    return errs;
  };

  const guardarBlog = async () => {
    const errs = validarBlog();
    if (Object.keys(errs).length) { setErrBlog(errs); return; }
    setGuardandoBlog(true);
    try {
      const payload = {
        idServicio: user.servicioId,
        titulo:     formBlog.titulo,
        texto:      formBlog.texto,
      };
      let blogGuardado;
      if (editandoBlogId) {
        blogGuardado = await api.blogs.actualizar(editandoBlogId, payload);
      } else {
        blogGuardado = await api.blogs.crear(payload);
      }

      // Si se seleccionó una imagen nueva, se sube una vez que el blog tiene ID
      if (archivoImagenBlog && blogGuardado?.idBlog) {
        try {
          await api.blogs.subirImagen(blogGuardado.idBlog, archivoImagenBlog);
        } catch {
          setErrorImagenBlog('La entrada se guardó, pero no se pudo subir la imagen.');
        }
      }

      await recargarBlogs();
      setShowModalBlog(false);
    } catch {
      alert('Error al guardar la entrada de blog. Intenta nuevamente.');
    } finally {
      setGuardandoBlog(false);
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

          {/* Logo / imagen del servicio */}
          <div className="me-logo">
            <img
              className="me-logo-img"
              src={imagenPreview || (imagenUrl ? `${BASE_URL}${imagenUrl}` : '/img/placeholder-empresa.png')}
              alt={`Logo de ${formServicio.nombre || 'tu empresa'}`}
            />
            <div className="me-logo-controles">
              <label className="me-btn-secondary" htmlFor="me-input-imagen">
                <ImageIcon size={16} /> Elegir imagen
              </label>
              <input
                id="me-input-imagen"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={seleccionarImagen}
                style={{ display: 'none' }}
              />
              {archivoImagen && (
                <>
                  <button className="me-btn-primary" onClick={subirImagen} disabled={subiendoImagen}>
                    {subiendoImagen ? 'Subiendo...' : 'Guardar imagen'}
                  </button>
                  <button className="me-btn-secondary" onClick={cancelarSeleccionImagen} disabled={subiendoImagen}>
                    Cancelar
                  </button>
                </>
              )}
              {errorImagen && <p className="text-danger">{errorImagen}</p>}
              <small className="text-muted">JPG, PNG o WEBP — máx. {TAMANO_MAX_MB} MB</small>
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

        {/* Sección: blog */}
        <div className="me-seccion">
          <div className="me-seccion-header">
            <h2><Newspaper size={18} /> Blog</h2>
            <button className="me-btn-primary" onClick={abrirAgregarBlog}>+ Nueva entrada</button>
          </div>

          {blogs.length === 0 ? (
            <div className="me-promos-empty">
              <Newspaper size={24} />
              <p>Aún no has publicado entradas de blog.</p>
              <p>Comparte consejos y novedades con tus clientes.</p>
            </div>
          ) : (
            <div className="me-blog-lista">
              {blogs.map(blog => (
                <div className="me-blog-card" key={blog.idBlog}>
                  <div className="me-blog-card-img">
                    {blog.imagen
                      ? <img src={`${BASE_URL}${blog.imagen}`} alt={blog.titulo} />
                      : <Newspaper size={28} />
                    }
                  </div>
                  <div className="me-blog-card-info">
                    <h3>{blog.titulo}</h3>
                    {blog.fecha && (
                      <small className="text-muted">
                        {new Date(blog.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </small>
                    )}
                    <p>{blog.texto}</p>
                  </div>
                  <div className="me-promo-actions">
                    <button className="me-promo-btn-edit" onClick={() => abrirEditarBlog(blog)}><Pencil size={14} /> Editar</button>
                    <button className="me-promo-btn-delete" onClick={() => eliminarBlog(blog.idBlog)}><Trash2 size={14} /> Eliminar</button>
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

      {/* Modal entrada de blog */}
      <Modal show={showModalBlog} onHide={() => setShowModalBlog(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editandoBlogId ? 'Editar entrada de blog' : 'Nueva entrada de blog'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Imagen de portada</Form.Label>
              <div className="me-logo">
                <img
                  className="me-logo-img"
                  src={imagenPreviewBlog || (imagenActualBlog ? `${BASE_URL}${imagenActualBlog}` : '/img/placeholder-empresa.png')}
                  alt="Portada de la entrada"
                />
                <div className="me-logo-controles">
                  <label className="me-btn-secondary" htmlFor="me-input-imagen-blog">
                    <ImageIcon size={16} /> Elegir imagen
                  </label>
                  <input
                    id="me-input-imagen-blog"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={seleccionarImagenBlog}
                    style={{ display: 'none' }}
                  />
                  {archivoImagenBlog && (
                    <button type="button" className="me-btn-secondary" onClick={limpiarSeleccionImagenBlog}>
                      Cancelar
                    </button>
                  )}
                  {errorImagenBlog && <p className="text-danger">{errorImagenBlog}</p>}
                  <small className="text-muted">
                    JPG, PNG o WEBP — máx. {TAMANO_MAX_MB} MB. Se sube al guardar la entrada.
                  </small>
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Título <span className="text-danger">*</span></Form.Label>
              <Form.Control
                isInvalid={!!errBlog.titulo}
                value={formBlog.titulo}
                placeholder="Ej: 5 consejos para el cuidado de tu mascota en invierno"
                onChange={e => { setFormBlog(p => ({ ...p, titulo: e.target.value })); setErrBlog(p => ({ ...p, titulo: '' })); }}
              />
              {errBlog.titulo && <Form.Text className="text-danger">{errBlog.titulo}</Form.Text>}
            </Form.Group>

            <Form.Group>
              <Form.Label>Contenido <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                isInvalid={!!errBlog.texto}
                value={formBlog.texto}
                placeholder="Escribe el contenido de la publicación..."
                onChange={e => { setFormBlog(p => ({ ...p, texto: e.target.value })); setErrBlog(p => ({ ...p, texto: '' })); }}
              />
              {errBlog.texto && <Form.Text className="text-danger">{errBlog.texto}</Form.Text>}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalBlog(false)} disabled={guardandoBlog}>Cancelar</Button>
          <Button style={{ backgroundColor: '#7e6492', border: 'none' }} onClick={guardarBlog} disabled={guardandoBlog}>
            {guardandoBlog ? 'Guardando...' : editandoBlogId ? 'Guardar cambios' : 'Publicar entrada'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
}

export default MiEmpresa;
