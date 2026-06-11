import { Routes, Route } from 'react-router-dom'
import Login from './components/login/Login'
import Register from './components/login/Register'
import Home from './components/home/Home'
import Nosotros from './components/nosotros/Nosotros'
import Contacto from './components/contacto/Contacto'
import Blogs from './components/blogs/Blogs'
import Servicios from './components/servicios/Servicios'
import ServicioDetalle from './components/servicios/ServicioDetalle'
import MisMascotas from './components/misMascotas/MisMascotas'
import MascotaDetalle from './components/misMascotas/MascotaDetalle'
import LoginEmpresa from './components/login/LoginEmpresa'
import MiEmpresa from './components/miEmpresa/MiEmpresa'
import PoliticaPrivacidad from './components/politicaPrivacidad/PoliticaPrivacidad'
import './App.css'

// AQUI ESTA LAS RUTAS DE LA APP, HACIA DONDE SE REDIRIGE

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/nosotros" element={<Nosotros />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/servicios" element={<Servicios />} />
      <Route path="/servicios/:id" element={<ServicioDetalle />} />
      <Route path="/mis-mascotas" element={<MisMascotas />} />
      <Route path="/mis-mascotas/:id" element={<MascotaDetalle />} />
      <Route path="/login-empresa" element={<LoginEmpresa />} />
      <Route path="/mi-empresa" element={<MiEmpresa />} />
      <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
