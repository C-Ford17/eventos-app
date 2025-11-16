// src/app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">


      {/* Hero principal */}
      <section className="flex flex-col items-center justify-center py-20 bg-cover bg-center" style={{backgroundImage: "url('/fondo-hero.jpg')"}}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-4 leading-tight">Descubre y Vive Experiencias<br />Inolvidables</h1>
        <p className="text-center text-lg text-neutral-400 mb-8 max-w-xl">
          La plataforma definitiva para encontrar, gestionar y disfrutar de los mejores eventos a tu alrededor.
        </p>
        <form className="w-full max-w-lg mx-auto flex items-center gap-2">
          <input className="flex-1 px-5 py-3 rounded bg-neutral-900 text-white" placeholder="Buscar por evento, lugar o fecha..." />
          <button className="px-5 py-3 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700" type="submit">Buscar</button>
        </form>
      </section>

      {/* Sección destacada de eventos */}
      <section className="px-6 md:px-20 py-10">
        <h2 className="text-2xl font-bold mb-7">No te pierdas esto</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Evento destacado mock */}
          <div className="bg-neutral-900 rounded-lg p-3"><img src="/rock.jpg" className="rounded mb-2" alt="Rock Indie" />
            <div className="font-semibold">Concierto de Rock Indie</div>
            <div className="text-neutral-400 text-sm">25 de Octubre - Arena Principal</div>
            <a href="#" className="text-blue-400 text-xs mt-1 block">Ver más detalles</a>
          </div>
          <div className="bg-neutral-900 rounded-lg p-3"><img src="/tech.jpg" className="rounded mb-2" alt="Tech Summit" />
            <div className="font-semibold">Tech Summit 2024</div>
            <div className="text-neutral-400 text-sm">1-3 de Noviembre - Centro de Convenciones</div>
            <a href="#" className="text-blue-400 text-xs mt-1 block">Ver más detalles</a>
          </div>
          <div className="bg-neutral-900 rounded-lg p-3"><img src="/acuar.jpg" className="rounded mb-2" alt="Acuarela" />
            <div className="font-semibold">Taller de Acuarela Creativa</div>
            <div className="text-neutral-400 text-sm">Sábados - Estudio de Arte Local</div>
            <a href="#" className="text-blue-400 text-xs mt-1 block">Ver más detalles</a>
          </div>
          <div className="bg-neutral-900 rounded-lg p-3"><img src="/festival.jpg" className="rounded mb-2" alt="Festival Electrónica" />
            <div className="font-semibold">Festival de Música Electrónica</div>
            <div className="text-neutral-400 text-sm">15 de Noviembre - Gran Parque Urbano</div>
            <a href="#" className="text-blue-400 text-xs mt-1 block">Ver más detalles</a>
          </div>
        </div>
      </section>

      {/* Beneficios / Por qué elegirnos */}
      <section className="py-12 px-6 md:px-20 bg-neutral-950 border-t border-neutral-800">
        <h2 className="text-2xl font-bold mb-4">¿Por qué elegirnos?</h2>
        <p className="max-w-xl mb-8 text-neutral-400">Te ofrecemos la mejor experiencia para descubrir y organizar eventos, todo en un solo lugar.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 rounded p-6 flex flex-col items-center">
            <span className="text-blue-400 text-3xl mb-2">🎫</span>
            <p className="font-semibold mb-1">Descubre eventos únicos</p>
            <p className="text-neutral-400 text-sm text-center">Explora un catálogo curado de eventos y encuentra tu próxima gran experiencia.</p>
          </div>
          <div className="bg-neutral-900 rounded p-6 flex flex-col items-center">
            <span className="text-blue-400 text-3xl mb-2">📱</span>
            <p className="font-semibold mb-1">Gestiona tus entradas</p>
            <p className="text-neutral-400 text-sm text-center">Compra, almacena y accede a tus entradas de forma segura desde cualquier dispositivo.</p>
          </div>
          <div className="bg-neutral-900 rounded p-6 flex flex-col items-center">
            <span className="text-blue-400 text-3xl mb-2">🗓️</span>
            <p className="font-semibold mb-1">Organiza con facilidad</p>
            <p className="text-neutral-400 text-sm text-center">Nuestras herramientas intuitivas hacen que la creación y gestión de tu evento sea un proceso simple.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 md:px-20 mt-auto border-t border-neutral-800 text-neutral-400 text-xs flex justify-between">
        <div>© 2024 EventPlatform. Todos los derechos reservados.</div>
        <div className="flex gap-4">
          <a href="#">Términos de Servicio</a>
          <a href="#">Política de Privacidad</a>
        </div>
      </footer>
    </div>
  );
}
