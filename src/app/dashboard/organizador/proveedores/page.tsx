// src/app/dashboard/organizador/proveedores/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, Mail, Phone, Briefcase, DollarSign, CheckCircle, XCircle, Truck, Camera, Video, Music, PenTool, Shield, Star, MessageSquare, Calendar } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

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

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Catering': return <Truck size={18} />;
    case 'Fotografía': return <Camera size={18} />;
    case 'Video': return <Video size={18} />;
    case 'Sonido': return <Music size={18} />;
    case 'Decoración': return <PenTool size={18} />;
    case 'Seguridad': return <Shield size={18} />;
    default: return <Star size={18} />;
  }
};

export default function ProveedoresPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalServicio, setModalServicio] = useState<Servicio | null>(null);
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');

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
    setEventoSeleccionado('');
  };

  const enviarSolicitud = async () => {
    if (!modalServicio) return;

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
          evento_id: eventoSeleccionado,
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Briefcase className="text-blue-500" size={32} />
          Proveedores de Servicios
        </h1>
        <p className="text-gray-400 mt-1">Encuentra y contrata los mejores servicios para tus eventos</p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar proveedores, servicios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-black/20 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <CustomDropdown
            options={[
              { value: 'todos', label: 'Todas las categorías' },
              { value: 'Catering', label: 'Catering' },
              { value: 'Fotografía', label: 'Fotografía' },
              { value: 'Video', label: 'Video' },
              { value: 'Sonido', label: 'Sonido' },
              { value: 'Decoración', label: 'Decoración' },
              { value: 'Transporte', label: 'Transporte' },
              { value: 'Seguridad', label: 'Seguridad' },
              { value: 'Tecnología', label: 'Tecnología' },
              { value: 'Entretenimiento', label: 'Entretenimiento' },
              { value: 'Otros', label: 'Otros' }
            ]}
            value={categoriaFiltro}
            onChange={(value) => setCategoriaFiltro(value)}
            placeholder="Filtrar por categoría"
            buttonClassName="pl-12" // Espacio para el icono a la izquierda
            className="md:w-64 w-full"
          />
        </div>
      </div>


      {/* Lista de proveedores */}
      <div className="space-y-6">
        {proveedoresFiltrados.map((proveedor) => (
          <div key={proveedor.id} className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 border-b border-white/5 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{proveedor.nombre}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-blue-500" />
                    {proveedor.email}
                  </div>
                  {proveedor.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-green-500" />
                      {proveedor.telefono}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
                <p className="text-blue-400 font-medium text-sm">
                  {proveedor.serviciosDisponibles} servicios disponibles
                </p>
              </div>
            </div>

            {/* Servicios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proveedor.servicios.map((servicio) => (
                <div
                  key={servicio.id}
                  className="group bg-black/20 hover:bg-black/40 border border-white/5 hover:border-blue-500/30 rounded-xl p-4 transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {servicio.nombre}
                      </h4>
                      {servicio.disponible ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-gray-500" />
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {servicio.descripcion}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-lg font-bold text-white flex items-center gap-1">
                      <DollarSign size={16} className="text-green-500" />
                      {servicio.precio.toLocaleString('es-CO')}
                    </span>
                    <button
                      onClick={() => handleSolicitarServicio(servicio)}
                      disabled={!servicio.disponible}
                      className="px-4 py-2 bg-white/5 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5"
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
        <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No encontramos proveedores</h3>
          <p className="text-gray-400 mb-8">Intenta ajustar tus filtros de búsqueda.</p>
          <button
            onClick={() => {
              setBusqueda('');
              setCategoriaFiltro('todos');
            }}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Modal de Solicitud */}
      {modalServicio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="text-blue-500" size={24} />
                Solicitar Servicio
              </h3>
              <button
                onClick={() => setModalServicio(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
              <p className="text-white font-semibold text-lg mb-1">{modalServicio.nombre}</p>
              <p className="text-gray-400 text-sm mb-3">{modalServicio.descripcion}</p>
              <p className="text-green-400 text-xl font-bold flex items-center gap-1">
                <DollarSign size={20} />
                {modalServicio.precio.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Selecciona el evento *
                </label>
                <select
                  value={eventoSeleccionado}
                  onChange={(e) => setEventoSeleccionado(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 text-white rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                  required
                >
                  <option value="" className="bg-neutral-900">-- Selecciona un evento --</option>
                  {eventos.map(evento => (
                    <option key={evento.id} value={evento.id} className="bg-neutral-900">
                      {evento.nombre} - {new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}
                    </option>
                  ))}
                </select>
                {eventos.length === 0 && (
                  <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
                    ⚠️ No tienes eventos creados. <a href="/dashboard/organizador/crear" className="underline hover:text-yellow-300">Crear evento</a>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Mensaje adicional (opcional)
                </label>
                <textarea
                  value={mensajeSolicitud}
                  onChange={(e) => setMensajeSolicitud(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/20 text-white rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder-gray-600"
                  placeholder="Describe detalles adicionales..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalServicio(null);
                  setEventoSeleccionado('');
                }}
                disabled={enviandoSolicitud}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={enviarSolicitud}
                disabled={enviandoSolicitud || !eventoSeleccionado}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enviandoSolicitud ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitud'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
