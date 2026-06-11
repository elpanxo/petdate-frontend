import AppNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import { ShieldCheck, Database, Target, Clock, Share2, UserCheck, Lock, Bell, Mail } from 'lucide-react'
import './PoliticaPrivacidad.css'

function PoliticaPrivacidad() {
  return (
    <>
      <AppNavbar />

      {/* Hero */}
      <section className="politica-hero">
        <div className="politica-hero__content">
          <ShieldCheck size={48} color="#5E438B" />
          <h1 className="politica-hero__title">Política de Privacidad</h1>
          <p className="politica-hero__slogan">
            Cómo recopilamos, usamos y protegemos tus datos personales y los de tus mascotas,
            en conformidad con la Ley N° 19.628 sobre Protección de la Vida Privada.
          </p>
          <p className="politica-hero__fecha">Última actualización: junio de 2026</p>
        </div>
      </section>

      {/* Contenido */}
      <section className="politica-contenido">
        <div className="politica-contenido__wrap">

          <article className="politica-bloque">
            <header className="politica-bloque__header">
              <UserCheck className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Responsable del tratamiento</h2>
            </header>
            <p>
              PetDate es la plataforma responsable de recopilar y tratar los datos personales
              que entregas al registrarte y usar nuestros servicios. Puedes contactarnos a
              través de los canales indicados al final de este documento para cualquier
              consulta relacionada con tus datos.
            </p>
          </article>

          <article className="politica-bloque">
            <header className="politica-bloque__header">
              <Database className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Qué datos recopilamos</h2>
            </header>
            <p>Para prestarte el servicio, tratamos las siguientes categorías de datos:</p>
            <ul className="politica-lista">
              <li><strong>Datos de tu cuenta:</strong> nombre, correo electrónico, teléfono, dirección y contraseña (almacenada siempre de forma cifrada, nunca en texto plano).</li>
              <li><strong>Datos de tus mascotas:</strong> nombre, especie, raza, edad y demás información que registres sobre ellas.</li>
              <li><strong>Datos de citas médicas:</strong> fechas, motivos, observaciones y demás información asociada a las atenciones que agendes.</li>
              <li><strong>Datos de uso y seguridad:</strong> registros de acceso (auditoría) que nos permiten detectar actividad sospechosa y proteger tu cuenta.</li>
            </ul>
          </article>

          <article className="politica-bloque">
            <header className="politica-bloque__header">
              <Target className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Para qué usamos tus datos</h2>
            </header>
            <ul className="politica-lista">
              <li>Crear y administrar tu cuenta, y permitir que inicies sesión de forma segura.</li>
              <li>Gestionar la información de tus mascotas y tus citas médicas dentro de la plataforma.</li>
              <li>Conectar dueños de mascotas con proveedores de servicios verificados.</li>
              <li>Enviar notificaciones relacionadas con tu cuenta o tus citas (cuando corresponda).</li>
              <li>Detectar y prevenir accesos no autorizados o usos indebidos de la plataforma.</li>
            </ul>
            <p>
              El tratamiento de tus datos se basa en el <strong>consentimiento expreso, libre e informado</strong>{' '}
              que entregas al registrarte y aceptar esta política, conforme a lo dispuesto en la Ley N° 19.628.
            </p>
          </article>

          <article className="politica-bloque">
            <header className="politica-bloque__header">
              <Clock className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Tiempo de conservación</h2>
            </header>
            <p>
              Conservamos tus datos mientras tu cuenta permanezca activa y mientras sean necesarios
              para cumplir las finalidades descritas en esta política. Si solicitas la eliminación de
              tu cuenta, tus datos personales, los de tus mascotas y los de tus citas médicas se
              eliminan en cascada de nuestros sistemas, salvo que exista una obligación legal que
              requiera conservar cierta información por un plazo adicional.
            </p>
          </article>

          <article className="politica-bloque">
            <header className="politica-bloque__header">
              <Share2 className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Con quién compartimos tus datos</h2>
            </header>
            <p>
              Tus datos circulan únicamente entre los servicios internos de PetDate (gestión de
              usuarios, mascotas, citas médicas y servicios) a través de nuestra puerta de enlace
              segura, con el fin de operar la plataforma. No vendemos ni cedemos tus datos
              personales a terceros con fines comerciales o publicitarios.
            </p>
          </article>

          <article className="politica-bloque">
            <header className="politica-bloque__header">
              <Lock className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Cómo protegemos tu información</h2>
            </header>
            <ul className="politica-lista">
              <li>Tu contraseña se almacena cifrada y nunca es visible, ni siquiera para nuestro equipo.</li>
              <li>Comunicaciones protegidas y control de acceso por roles dentro de la plataforma.</li>
              <li>Registros de auditoría de inicios de sesión para detectar actividad inusual.</li>
              <li>Mecanismos de protección contra intentos de acceso indebido (bloqueo temporal tras intentos fallidos repetidos).</li>
            </ul>
          </article>

          <article className="politica-bloque">
            <header className="politica-bloque__header">
              <UserCheck className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Tus derechos (Derechos ARCO)</h2>
            </header>
            <p>
              De acuerdo con la Ley N° 19.628, en cualquier momento puedes ejercer los siguientes
              derechos sobre tus datos personales:
            </p>
            <ul className="politica-lista">
              <li><strong>Acceso:</strong> conocer qué datos tuyos tenemos y cómo los usamos.</li>
              <li><strong>Rectificación:</strong> corregir datos que estén desactualizados, sean inexactos o incompletos.</li>
              <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios o retires tu consentimiento.</li>
              <li><strong>Oposición:</strong> oponerte a un tratamiento específico de tus datos por motivos legítimos.</li>
            </ul>
            <p>
              Puedes ejercer estos derechos directamente desde tu perfil (por ejemplo, editando tus
              datos o eliminando tu cuenta) o contactándonos a través de los canales indicados a
              continuación. Responderemos tu solicitud dentro de los plazos que establece la ley.
            </p>
          </article>

          <article className="politica-bloque">
            <header className="politica-bloque__header">
              <Bell className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Cambios a esta política</h2>
            </header>
            <p>
              Si actualizamos esta política de privacidad, publicaremos la nueva versión en esta
              misma página indicando la fecha de la última actualización. Si los cambios son
              sustanciales, te lo notificaremos por los medios de contacto que tengamos registrados.
            </p>
          </article>

          <article className="politica-bloque politica-bloque--contacto">
            <header className="politica-bloque__header">
              <Mail className="politica-bloque__icon" size={28} color="#5E438B" />
              <h2>Contacto</h2>
            </header>
            <p>
              Si tienes dudas sobre esta política o quieres ejercer tus derechos ARCO, escríbenos a
              través de nuestra sección de <a href="/contacto">Contacto</a> y te responderemos a la
              brevedad.
            </p>
          </article>

        </div>
      </section>

      <Footer />
    </>
  )
}

export default PoliticaPrivacidad
