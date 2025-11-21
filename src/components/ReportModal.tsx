// src/components/ReportModal.tsx
'use client';
import { useState } from 'react';
import { XCircle, Flag, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tipo: 'evento' | 'servicio' | 'usuario' | 'bug';
    entidadId?: string;
    entidadNombre?: string;
    reportanteId: string;
}

const categoriasPorTipo = {
    evento: [
        'Contenido inapropiado',
        'Información engañosa',
        'Fraude/Estafa',
        'Cancelado sin aviso',
        'Otro',
    ],
    servicio: [
        'Mala calidad',
        'No cumplió lo prometido',
        'Precio inapropiado',
        'Comportamiento no profesional',
        'Otro',
    ],
    usuario: [
        'Acoso',
        'Spam',
        'Comportamiento inapropiado',
        'Suplantación de identidad',
        'Otro',
    ],
    bug: [
        'Error/Bug',
        'Solicitud de función',
        'Problema de rendimiento',
        'Problema de UI/UX',
        'Otro',
    ],
};

const prioridades = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' },
];

export default function ReportModal({
    isOpen,
    onClose,
    tipo,
    entidadId,
    entidadNombre,
    reportanteId,
}: ReportModalProps) {
    const [categoria, setCategoria] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [prioridad, setPrioridad] = useState('media');
    const [enviando, setEnviando] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoria || !descripcion) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        setEnviando(true);

        try {
            const response = await fetch('/api/reportes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo_reporte: tipo,
                    categoria,
                    descripcion,
                    prioridad: tipo === 'bug' ? prioridad : 'media',
                    reportante_id: reportanteId,
                    evento_id: tipo === 'evento' ? entidadId : undefined,
                    servicio_id: tipo === 'servicio' ? entidadId : undefined,
                    usuario_reportado_id: tipo === 'usuario' ? entidadId : undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Reporte enviado exitosamente. Será revisado por un administrador.');
                setCategoria('');
                setDescripcion('');
                setPrioridad('media');
                onClose();
            } else {
                alert('❌ Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar reporte');
        } finally {
            setEnviando(false);
        }
    };

    const getTitulo = () => {
        switch (tipo) {
            case 'evento':
                return `Reportar Evento${entidadNombre ? `: ${entidadNombre}` : ''}`;
            case 'servicio':
                return `Reportar Servicio${entidadNombre ? `: ${entidadNombre}` : ''}`;
            case 'usuario':
                return `Reportar Usuario${entidadNombre ? `: ${entidadNombre}` : ''}`;
            case 'bug':
                return 'Reportar Problema Técnico';
            default:
                return 'Enviar Reporte';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Flag className="text-red-500" size={24} />
                        {getTitulo()}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={enviando}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Alert */}
                <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-yellow-200 text-sm">
                        Los reportes falsos o malintencionados pueden resultar en la suspensión de tu cuenta.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Categoría */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Categoría *
                        </label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-black/20 text-white rounded-xl border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        >
                            <option value="" className="bg-neutral-900">-- Selecciona una categoría --</option>
                            {categoriasPorTipo[tipo].map((cat) => (
                                <option key={cat} value={cat} className="bg-neutral-900">
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Prioridad (solo para bugs) */}
                    {tipo === 'bug' && (
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Prioridad
                            </label>
                            <select
                                value={prioridad}
                                onChange={(e) => setPrioridad(e.target.value)}
                                className="w-full px-4 py-3 bg-black/20 text-white rounded-xl border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                            >
                                {prioridades.map((p) => (
                                    <option key={p.value} value={p.value} className="bg-neutral-900">
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Descripción */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Descripción del problema *
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                            rows={6}
                            placeholder="Describe detalladamente el problema..."
                            className="w-full px-4 py-3 bg-black/20 text-white rounded-xl border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none placeholder-gray-600"
                        />
                        <p className="text-gray-500 text-xs mt-1">
                            Mínimo 20 caracteres
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={enviando}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/5 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={enviando || !categoria || descripcion.length < 20}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {enviando ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Reporte'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
