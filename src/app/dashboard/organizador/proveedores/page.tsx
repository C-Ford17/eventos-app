// src/app/dashboard/organizador/proveedores/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
}

interface Proveedor {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  servicios: Servicio[];
  totalServicios: number;
  serviciosDisponibles: number;
}

export default function ProveedoresPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalServicio, setModalServicio] = useState<Servicio | null>(null);
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]); // ✅ NUEVO
  const [eventoSeleccionado, setEventoSeleccionado] = useState(''); // ✅ NUEVO

// ✅ Cargar eventos del organizador
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    fetch(`/api/eventos?organizador_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEventos(data.eventos);
        }
      })
      .catch(err => console.error('Error cargando eventos:', err));
  }, []);

  useEffect(() => {
    cargarProveedores();
  }, [categoriaFiltro]);

  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoriaFiltro !== 'todos') {
        params.append('categoria', categoriaFiltro);
      }

      const response = await fetch(`/api/proveedores?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProveedores(data.proveedores);
      }
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    const matchBusqueda = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.servicios.some(s => 
        s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    return matchBusqueda && p.servicios.length > 0;
  });

  const handleSolicitarServicio = async (servicio: Servicio) => {
    setModalServicio(servicio);
    setMensajeSolicitud('');
    setEventoSeleccionado(''); // ✅ Resetear evento seleccionado
  };

  const enviarSolicitud = async () => {
    if (!modalServicio) return;

    // ✅ Validar que se seleccionó un evento
    if (!eventoSeleccionado) {
      alert('❌ Debes seleccionar un evento');
      return;
    }

    setEnviandoSolicitud(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch('/api/solicitar-servicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio_id: modalServicio.id,
          organizador_id: user.id,
          evento_id: eventoSeleccionado, // ✅ Enviar evento seleccionado
          mensaje: mensajeSolicitud,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Solicitud enviada a ${data.proveedor.nombre}\n\n📧 ${data.proveedor.email}`);
        setModalServicio(null);
        setEventoSeleccionado('');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar solicitud');
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Proveedores de Servicios</h1>
      </div>

      {/* Filtros */}
      <div className="bg-neutral-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buscar proveedores o servicios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-4 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-4 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas las categorías</option>
            <option value="Catering">Catering</option>
            <option value="Fotografía">Fotografía</option>
            <option value="Video">Video</option>
            <option value="Sonido">Sonido</option>
            <option value="Decoración">Decoración</option>
            <option value="Transporte">Transporte</option>
            <option value="Seguridad">Seguridad</option>
          </select>
        </div>
      </div>

      {/* Lista de proveedores con servicios */}
      <div className="space-y-6">
        {proveedoresFiltrados.map((proveedor) => (
          <div key={proveedor.id} className="bg-neutral-800 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">{proveedor.nombre}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {proveedor.serviciosDisponibles} de {proveedor.totalServicios} servicios disponibles
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">📧 {proveedor.email}</p>
                {proveedor.telefono && (
                  <p className="text-gray-400 text-sm">📞 {proveedor.telefono}</p>
                )}
              </div>
            </div>

            {/* Servicios del proveedor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proveedor.servicios.map((servicio) => (
                <div
                  key={servicio.id}
                  className="bg-neutral-900 p-4 rounded border border-neutral-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-white">{servicio.nombre}</h4>
                    {servicio.disponible ? (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                        Disponible
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
                        No disponible
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {servicio.descripcion}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-400">
                      ${servicio.precio.toLocaleString('es-CO')}
                    </span>
                    <button
                      onClick={() => handleSolicitarServicio(servicio)}
                      disabled={!servicio.disponible}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-semibold transition"
                    >
                      Solicitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {proveedoresFiltrados.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-400 text-lg">No se encontraron proveedores</p>
          <button
            onClick={() => {
              setBusqueda('');
              setCategoriaFiltro('todos');
            }}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* ✅ Modal actualizado con selector de evento */}
      {modalServicio && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              Solicitar Servicio
            </h3>

            <div className="mb-4">
              <p className="text-gray-300 font-semibold">{modalServicio.nombre}</p>
              <p className="text-gray-400 text-sm mt-1">{modalServicio.descripcion}</p>
              <p className="text-blue-400 text-lg font-bold mt-2">
                ${modalServicio.precio.toLocaleString('es-CO')}
              </p>
            </div>

            {/* ✅ NUEVO: Selector de evento */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">
                Selecciona el evento *
              </label>
              <select
                value={eventoSeleccionado}
                onChange={(e) => setEventoSeleccionado(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Selecciona un evento --</option>
                {eventos.map(evento => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nombre} - {new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}
                  </option>
                ))}
              </select>
              {eventos.length === 0 && (
                <p className="text-yellow-400 text-xs mt-2">
                  ⚠️ No tienes eventos creados. <a href="/dashboard/organizador/crear" className="underline">Crear evento</a>
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">
                Mensaje adicional (opcional)
              </label>
              <textarea
                value={mensajeSolicitud}
                onChange={(e) => setMensajeSolicitud(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe detalles adicionales de tu evento..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={enviarSolicitud}
                disabled={enviandoSolicitud || !eventoSeleccionado}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded font-semibold transition"
              >
                {enviandoSolicitud ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
              <button
                onClick={() => {
                  setModalServicio(null);
                  setEventoSeleccionado('');
                }}
                disabled={enviandoSolicitud}
                className="px-6 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded font-semibold transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
