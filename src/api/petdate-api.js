/**
 * PetDate API Client
 * Cliente centralizado para el API Gateway en http://localhost:8080
 *
 * Uso básico:
 *   import api from './petdate-api.js'
 *
 *   // Login
 *   await api.auth.login('correo@mail.com', 'password123')
 *
 *   // Obtener mascotas del usuario
 *   const page = await api.mascotas.porUsuario(1)
 *   console.log(page.content) // array de mascotas
 */

// ─────────────────────────────────────────────
// Configuración base
// ─────────────────────────────────────────────

const BASE_URL = 'http://localhost:8080'

const TOKEN_KEY = 'petdate_token'

// ─────────────────────────────────────────────
// Gestión del token
// ─────────────────────────────────────────────

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  remove: () => localStorage.removeItem(TOKEN_KEY),
  exists: () => !!localStorage.getItem(TOKEN_KEY),
}

// ─────────────────────────────────────────────
// Núcleo HTTP
// ─────────────────────────────────────────────

/**
 * Construye los headers. Agrega Authorization solo si hay token guardado.
 */
function buildHeaders(includeAuth = true) {
  const headers = { 'Content-Type': 'application/json' }
  if (includeAuth && token.exists()) {
    headers['Authorization'] = `Bearer ${token.get()}`
  }
  return headers
}

/**
 * Clase de error enriquecida con el status HTTP y el body del error.
 */
export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/**
 * Ejecuta el fetch y maneja errores de forma uniforme.
 * - 204 No Content → devuelve null
 * - 4xx / 5xx      → lanza ApiError con el body del error
 * - 2xx            → devuelve el JSON parseado
 *
 * @param {string} path    - ruta relativa, e.g. '/auth/login'
 * @param {RequestInit} options - opciones de fetch
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`

  let response
  try {
    response = await fetch(url, options)
  } catch (networkError) {
    throw new ApiError(0, 'Error de red: no se pudo conectar al servidor', null)
  }

  // Sin contenido (DELETE exitoso, etc.)
  if (response.status === 204) return null

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Error ${response.status}: ${response.statusText}`
    throw new ApiError(response.status, message, data)
  }

  return data
}

// Helpers internos por método HTTP
const http = {
  get: (path, auth = true) =>
    request(path, { method: 'GET', headers: buildHeaders(auth) }),

  post: (path, body, auth = true) =>
    request(path, {
      method: 'POST',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    }),

  put: (path, body, auth = true) =>
    request(path, {
      method: 'PUT',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    }),

  patch: (path, auth = true) =>
    request(path, { method: 'PATCH', headers: buildHeaders(auth) }),

  delete: (path, auth = true) =>
    request(path, { method: 'DELETE', headers: buildHeaders(auth) }),
}

// ─────────────────────────────────────────────
// Helper de paginación
// ─────────────────────────────────────────────

/**
 * Construye el query string de paginación de Spring.
 * @param {object} opts
 * @param {number} [opts.page=0]   - índice de página (0-based)
 * @param {number} [opts.size=10]  - elementos por página
 * @param {string} [opts.sort]     - campo de ordenamiento, e.g. 'nombre'
 */
function pageParams({ page = 0, size = 10, sort } = {}) {
  const params = new URLSearchParams({ page, size })
  if (sort) params.set('sort', sort)
  return `?${params.toString()}`
}

// ─────────────────────────────────────────────
// 1. AUTH  →  rutas públicas
// ─────────────────────────────────────────────

/**
 * @typedef {Object} AuthResponse
 * @property {string} token - JWT
 */

export const auth = {
  /**
   * Inicia sesión y guarda el token automáticamente.
   * @param {string} correo
   * @param {string} contrasena
   * @returns {Promise<AuthResponse>}
   */
  async login(correo, contrasena) {
    const data = await http.post('/auth/login', { correo, contrasena }, false)
    token.set(data.token)
    return data
  },

  /**
   * Inicia sesión como empresa/servicio y guarda el token.
   * @param {string} correo
   * @param {string} contrasena
   * @returns {Promise<AuthResponse>}
   */
  async loginEmpresa(correo, contrasena) {
    const data = await http.post('/auth/servicios/login', { correo, contrasena }, false)
    token.set(data.token)
    return data
  },

  /** Elimina el token guardado (logout local). */
  logout() {
    token.remove()
  },
}

// ─────────────────────────────────────────────
// 2. USUARIOS  →  /usuarios
// ─────────────────────────────────────────────

/**
 * @typedef {Object} UsuarioRequest
 * @property {string} nombre        - 3-50 caracteres (obligatorio)
 * @property {string} correo        - email válido (obligatorio)
 * @property {string} contrasena    - 6-100 caracteres (obligatorio)
 * @property {string} [telefono]
 * @property {string} [direccion]
 */

/**
 * @typedef {Object} UsuarioResponse
 * @property {number} id
 * @property {string} nombre
 * @property {string} correo
 * @property {string} telefono
 * @property {string} direccion
 * @property {string} fechaRegistro  - ISO datetime
 */

export const usuarios = {
  /**
   * Registro de nuevo usuario (ruta pública).
   * @param {UsuarioRequest} data
   * @returns {Promise<UsuarioResponse>}
   */
  crear: (data) => http.post('/usuarios', data, false),

  /**
   * Lista todos los usuarios (requiere auth).
   * @returns {Promise<UsuarioResponse[]>}
   */
  listar: () => http.get('/usuarios'),

  /**
   * Busca un usuario por su ID.
   * @param {number} id
   * @returns {Promise<UsuarioResponse>}
   */
  porId: (id) => http.get(`/usuarios/${id}`),

  /**
   * Busca un usuario por su correo.
   * @param {string} correo
   * @returns {Promise<UsuarioResponse>}
   */
  porCorreo: (correo) => http.get(`/usuarios/correo/${encodeURIComponent(correo)}`),

  /**
   * Actualiza los datos de un usuario.
   * @param {number} id
   * @param {UsuarioRequest} data
   * @returns {Promise<UsuarioResponse>}
   */
  actualizar: (id, data) => http.put(`/usuarios/${id}`, data),

  /**
   * Elimina un usuario.
   * @param {number} id
   * @returns {Promise<null>}
   */
  eliminar: (id) => http.delete(`/usuarios/${id}`),
}

// ─────────────────────────────────────────────
// 3. MASCOTAS  →  /mascotas
// ─────────────────────────────────────────────

/**
 * @typedef {Object} MascotaRequest
 * @property {string} nombre            - 2-50 caracteres (obligatorio)
 * @property {string} especie           - obligatorio
 * @property {string} raza              - obligatorio
 * @property {number} edad              - 0-50
 * @property {string} tamano            - obligatorio
 * @property {number} usuarioId         - obligatorio
 * @property {number} peso              - >= 0
 * @property {string} sexo              - obligatorio
 * @property {string} [fecha_nacimineto] - ISO date string 'YYYY-MM-DD'
 * @property {string} [color]
 * @property {string} [observaciones]
 * @property {string} [info_medica_basica]
 */

/**
 * @typedef {Object} MascotaResponse
 * @property {number} id
 * @property {string} nombre
 * @property {string} especie
 * @property {string} raza
 * @property {number} edad
 * @property {string} tamano
 * @property {number} usuarioId
 * @property {number} peso
 * @property {string} sexo
 * @property {string} fecha_nacimineto
 * @property {string} color
 * @property {string} observaciones
 * @property {string} info_medica_basica
 */

/**
 * @typedef {Object} SpringPage
 * @property {Array}  content          - array de elementos
 * @property {number} totalElements    - total de registros
 * @property {number} totalPages       - total de páginas
 * @property {number} number           - página actual (0-based)
 * @property {number} size             - tamaño de página
 * @property {boolean} first
 * @property {boolean} last
 */

export const mascotas = {
  /**
   * Crea una nueva mascota.
   * @param {MascotaRequest} data
   * @returns {Promise<MascotaResponse>}
   */
  crear: (data) => http.post('/mascotas', data),

  /**
   * Lista todas las mascotas paginadas.
   * @param {{ page?, size?, sort? }} [pagination]
   * @returns {Promise<SpringPage<MascotaResponse>>}
   */
  listar: (pagination) => http.get(`/mascotas${pageParams(pagination)}`),

  /**
   * Busca una mascota por ID.
   * @param {number} id
   * @returns {Promise<MascotaResponse>}
   */
  porId: (id) => http.get(`/mascotas/${id}`),

  /**
   * Lista las mascotas de un usuario específico.
   * @param {number} usuarioId
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<MascotaResponse>>}
   */
  porUsuario: (usuarioId, pagination) =>
    http.get(`/mascotas/usuario/${usuarioId}${pageParams(pagination)}`),

  /**
   * Actualiza una mascota.
   * @param {number} id
   * @param {MascotaRequest} data
   * @returns {Promise<MascotaResponse>}
   */
  actualizar: (id, data) => http.put(`/mascotas/${id}`, data),

  /**
   * Elimina una mascota.
   * @param {number} id
   * @returns {Promise<null>}
   */
  eliminar: (id) => http.delete(`/mascotas/${id}`),
}

// ─────────────────────────────────────────────
// 4. CITAS MÉDICAS  →  /citas
// ─────────────────────────────────────────────

/**
 * @typedef {'PENDIENTE'|'COMPLETADO'|'VENCIDO'} EstadoEvento
 */

/**
 * @typedef {Object} CitaMedicaRequest
 * @property {number} idUsuario          - obligatorio
 * @property {number} idMascota          - obligatorio
 * @property {string} tipoEvento         - obligatorio
 * @property {string} fecha              - 'YYYY-MM-DD' (obligatorio)
 * @property {string} hora               - 'HH:MM:SS'  (obligatorio)
 * @property {string} [descripcion]
 * @property {string} [observacion]
 * @property {EstadoEvento} [estado]
 */

/**
 * @typedef {Object} CitaMedicaResponse
 * @property {number} idEvento
 * @property {number} idUsuario
 * @property {number} idMascota
 * @property {string} tipoEvento
 * @property {string} fecha
 * @property {string} hora
 * @property {string} descripcion
 * @property {string} observacion
 * @property {EstadoEvento} estado
 */

export const citas = {
  /**
   * Agenda una nueva cita médica.
   * @param {CitaMedicaRequest} data
   * @returns {Promise<CitaMedicaResponse>}
   */
  crear: (data) => http.post('/citas', data),

  /**
   * Lista todas las citas paginadas.
   * @param {{ page?, size?, sort? }} [pagination]
   * @returns {Promise<SpringPage<CitaMedicaResponse>>}
   */
  listar: (pagination) => http.get(`/citas${pageParams({ sort: 'fecha', ...pagination })}`),

  /**
   * Busca una cita por ID.
   * @param {number} id
   * @returns {Promise<CitaMedicaResponse>}
   */
  porId: (id) => http.get(`/citas/${id}`),

  /**
   * Lista las citas de un usuario.
   * @param {number} idUsuario
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<CitaMedicaResponse>>}
   */
  porUsuario: (idUsuario, pagination) =>
    http.get(`/citas/usuario/${idUsuario}${pageParams(pagination)}`),

  /**
   * Lista las citas de una mascota.
   * @param {number} idMascota
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<CitaMedicaResponse>>}
   */
  porMascota: (idMascota, pagination) =>
    http.get(`/citas/mascota/${idMascota}${pageParams(pagination)}`),

  /**
   * Lista las citas filtradas por estado.
   * @param {EstadoEvento} estado
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<CitaMedicaResponse>>}
   */
  porEstado: (estado, pagination) =>
    http.get(`/citas/estado/${estado}${pageParams(pagination)}`),

  /**
   * Lista las citas de un usuario filtradas por estado.
   * @param {number} idUsuario
   * @param {EstadoEvento} estado
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<CitaMedicaResponse>>}
   */
  porUsuarioYEstado: (idUsuario, estado, pagination) =>
    http.get(`/citas/usuario/${idUsuario}/estado/${estado}${pageParams(pagination)}`),

  /**
   * Actualiza una cita completa.
   * @param {number} id
   * @param {CitaMedicaRequest} data
   * @returns {Promise<CitaMedicaResponse>}
   */
  actualizar: (id, data) => http.put(`/citas/${id}`, data),

  /**
   * Cambia solo el estado de una cita (PATCH).
   * @param {number} id
   * @param {EstadoEvento} estado
   * @returns {Promise<CitaMedicaResponse>}
   */
  cambiarEstado: (id, estado) => http.patch(`/citas/${id}/estado/${estado}`),

  /**
   * Elimina una cita.
   * @param {number} id
   * @returns {Promise<null>}
   */
  eliminar: (id) => http.delete(`/citas/${id}`),
}

// ─────────────────────────────────────────────
// 5. SERVICIOS  →  /servicios
// ─────────────────────────────────────────────

/**
 * @typedef {Object} ServicioRequest
 * @property {string} nombreServicio    - obligatorio
 * @property {string} tipoServicio      - obligatorio
 * @property {string} rutEmpresa        - 8-12 chars (obligatorio)
 * @property {string} correo            - email (obligatorio)
 * @property {string} contrasena        - min 6 chars (obligatorio)
 * @property {string} [descripcion]
 * @property {string} [direccion]
 * @property {string} [comuna]
 * @property {string} [horario]
 * @property {string} [telefono]
 * @property {string} [whatsApp]        - solo números
 * @property {string} [sitioWeb]
 * @property {string} [instagram]
 * @property {string} [facebook]
 */

/**
 * @typedef {Object} ServicioResponse
 * @property {number} idServicio
 * @property {string} nombreServicio
 * @property {string} tipoServicio
 * @property {string} rutEmpresa
 * @property {string} correo
 * @property {string} descripcion
 * @property {string} direccion
 * @property {string} comuna
 * @property {string} horario
 * @property {string} telefono
 * @property {string} whatsApp
 * @property {string} sitioWeb
 * @property {string} instagram
 * @property {string} facebook
 */

export const servicios = {
  /**
   * Registra un servicio (ruta pública, no requiere auth).
   * @param {ServicioRequest} data
   * @returns {Promise<ServicioResponse>}
   */
  crear: (data) => http.post('/servicios', data, false),

  /**
   * Lista todos los servicios paginados.
   * @param {{ page?, size?, sort? }} [pagination]
   * @returns {Promise<SpringPage<ServicioResponse>>}
   */
  listar: (pagination) =>
    http.get(`/servicios${pageParams({ sort: 'nombreServicio', ...pagination })}`),

  /**
   * Busca un servicio por ID.
   * @param {number} id
   * @returns {Promise<ServicioResponse>}
   */
  porId: (id) => http.get(`/servicios/${id}`),

  /**
   * Busca servicios por tipo.
   * @param {string} tipoServicio
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<ServicioResponse>>}
   */
  porTipo: (tipoServicio, pagination) =>
    http.get(`/servicios/tipo/${encodeURIComponent(tipoServicio)}${pageParams(pagination)}`),

  /**
   * Busca servicios por comuna.
   * @param {string} comuna
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<ServicioResponse>>}
   */
  porComuna: (comuna, pagination) =>
    http.get(`/servicios/comuna/${encodeURIComponent(comuna)}${pageParams(pagination)}`),

  /**
   * Actualiza un servicio.
   * @param {number} id
   * @param {ServicioRequest} data
   * @returns {Promise<ServicioResponse>}
   */
  actualizar: (id, data) => http.put(`/servicios/${id}`, data),

  /**
   * Elimina un servicio.
   * @param {number} id
   * @returns {Promise<null>}
   */
  eliminar: (id) => http.delete(`/servicios/${id}`),
}

// ─────────────────────────────────────────────
// 6. PROMOCIONES  →  /promociones
// ─────────────────────────────────────────────

/**
 * @typedef {Object} PromocionRequest
 * @property {number} idServicio        - obligatorio
 * @property {string} titulo            - obligatorio
 * @property {string} [descripcion]
 * @property {string} fechaInicio       - 'YYYY-MM-DD' (obligatorio)
 * @property {string} fechaTermino      - 'YYYY-MM-DD' (obligatorio)
 */

/**
 * @typedef {Object} PromocionResponse
 * @property {number} idPromocion
 * @property {number} idServicio
 * @property {string} titulo
 * @property {string} descripcion
 * @property {string} fechaInicio
 * @property {string} fechaTermino
 */

export const promociones = {
  /**
   * Crea una promoción para un servicio.
   * @param {PromocionRequest} data
   * @returns {Promise<PromocionResponse>}
   */
  crear: (data) => http.post('/promociones', data),

  /**
   * Lista todas las promociones paginadas.
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<PromocionResponse>>}
   */
  listar: (pagination) => http.get(`/promociones${pageParams(pagination)}`),

  /**
   * Busca una promoción por ID.
   * @param {number} id
   * @returns {Promise<PromocionResponse>}
   */
  porId: (id) => http.get(`/promociones/${id}`),

  /**
   * Lista las promociones de un servicio específico.
   * @param {number} idServicio
   * @param {{ page?, size? }} [pagination]
   * @returns {Promise<SpringPage<PromocionResponse>>}
   */
  porServicio: (idServicio, pagination) =>
    http.get(`/promociones/servicio/${idServicio}${pageParams(pagination)}`),

  /**
   * Actualiza una promoción.
   * @param {number} id
   * @param {PromocionRequest} data
   * @returns {Promise<PromocionResponse>}
   */
  actualizar: (id, data) => http.put(`/promociones/${id}`, data),

  /**
   * Elimina una promoción.
   * @param {number} id
   * @returns {Promise<null>}
   */
  eliminar: (id) => http.delete(`/promociones/${id}`),
}

// ─────────────────────────────────────────────
// Export default (objeto unificado)
// ─────────────────────────────────────────────

/**
 * Cliente API unificado de PetDate.
 *
 * @example
 * import api from './petdate-api.js'
 *
 * // Login
 * await api.auth.login('user@mail.com', '123456')
 *
 * // Mascotas del usuario autenticado
 * const { content } = await api.mascotas.porUsuario(3)
 *
 * // Crear cita
 * await api.citas.crear({
 *   idUsuario: 3,
 *   idMascota: 7,
 *   tipoEvento: 'Consulta general',
 *   fecha: '2025-08-15',
 *   hora: '10:30:00',
 * })
 *
 * // Cambiar estado de una cita
 * await api.citas.cambiarEstado(12, 'COMPLETADO')
 *
 * // Manejo de errores
 * try {
 *   await api.auth.login('x@x.com', 'wrong')
 * } catch (e) {
 *   if (e.status === 401) console.log('Credenciales inválidas')
 * }
 */
const api = {
  auth,
  token,
  usuarios,
  mascotas,
  citas,
  servicios,
  promociones,
}

export default api