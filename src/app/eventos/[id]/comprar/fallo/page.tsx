'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function FalloCompraPage() {
  const params = useParams();
  const eventoId = params.id;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Pago fallido</h1>
        <p className="text-gray-400 mb-8">
          Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o contacta a soporte.
        </p>
        <div className="space-y-3">
          <Link
            href={`/eventos/${eventoId}`}
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Volver al evento
          </Link>
          <Link
            href="/ayuda"
            className="block w-full py-3 bg-transparent border border-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-semibold transition"
          >
            Contactar soporte
          </Link>
        </div>
      </div>
    </div>
  );
}
