import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import { Stethoscope, Beef, Bath, Dog, Cat, Home as HomeIcon } from 'lucide-react'
import './Blogs.css'

const posts = [
  {
    id: 1,
    categoria: 'Salud',
    categoriaColor: '#7e6492',
    titulo: '¿Cómo saber si tu mascota necesita ir al veterinario?',
    extracto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation...',
    bg: 'linear-gradient(135deg, #f5f0fa 0%, #d8c9ed 100%)',
    Icon: Stethoscope,
  },
  {
    id: 2,
    categoria: 'Nutrición',
    categoriaColor: '#4a90a4',
    titulo: 'Alimentación saludable para tu perro según su edad',
    extracto: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate...',
    bg: 'linear-gradient(135deg, #eaf4f8 0%, #b8dce8 100%)',
    Icon: Beef,
  },
  {
    id: 3,
    categoria: 'Cuidados',
    categoriaColor: '#e07b54',
    titulo: 'Guía completa para el baño y aseo de tu gato',
    extracto: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident...',
    bg: 'linear-gradient(135deg, #fff3ee 0%, #f5c9b0 100%)',
    Icon: Bath,
  },
  {
    id: 4,
    categoria: 'Entrenamiento',
    categoriaColor: '#7e6492',
    titulo: '5 técnicas de adiestramiento positivo para cachorros',
    extracto: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing...',
    bg: 'linear-gradient(135deg, #f0ecfa 0%, #c9b8e8 100%)',
    Icon: Dog,
  },
  {
    id: 5,
    categoria: 'Bienestar',
    categoriaColor: '#4a90a4',
    titulo: 'Señales de estrés en mascotas y cómo ayudarlas',
    extracto: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis...',
    bg: 'linear-gradient(135deg, #e6f5f9 0%, #a8d5e5 100%)',
    Icon: Cat,
  },
  {
    id: 6,
    categoria: 'Servicios',
    categoriaColor: '#e07b54',
    titulo: 'Todo lo que necesitas saber sobre la guardería para mascotas',
    extracto: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt...',
    bg: 'linear-gradient(135deg, #fff0ea 0%, #f0b896 100%)',
    Icon: HomeIcon,
  },
]

function Blogs() {
  return (
    <>
      <AppNavbar />

      {/* Hero */}
      <section className="blogs-hero">
        <div className="blogs-hero__content">
          <h1 className="blogs-hero__title">Blog PetDate</h1>
          <p className="blogs-hero__slogan">Explora artículos, consejos y novedades sobre el cuidado de tus mascotas.</p>
        </div>
      </section>

      {/* Grid de posts */}
      <section className="blogs-section">
        <div className="blogs-grid">
          {posts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card__image" style={{ background: post.bg }}>
                <post.Icon className="blog-card__emoji" size={48} />
              </div>
              <div className="blog-card__body">
                <span
                  className="blog-card__categoria"
                  style={{ backgroundColor: post.categoriaColor }}
                >
                  {post.categoria}
                </span>
                <h3 className="blog-card__titulo">{post.titulo}</h3>
                <p className="blog-card__extracto">{post.extracto}</p>
                <button className="blog-card__btn">Ver más</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Blogs
