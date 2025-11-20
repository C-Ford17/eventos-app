'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ConnectMercadoPagoProps {
    userId: string;
    isConnected: boolean;
}

export default function ConnectMercadoPago({ userId, isConnected }: ConnectMercadoPagoProps) {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    useEffect(() => {
        if (success === 'connected') {
            // Optional: Clear params or show toast
            router.refresh();
        }
    }, [success, router]);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mercadopago/auth-url?userId=${userId}`);
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No URL returned');
            }
        } catch (err) {
            console.error('Error fetching auth URL:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Pagos con Mercado Pago</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Vincula tu cuenta de Mercado Pago para recibir los pagos de tus eventos directamente.
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error al vincular: {error}</span>
                </div>
            )}

            {isConnected ? (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>Cuenta vinculada correctamente</span>
                </div>
            ) : (
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Vincular Mercado Pago
                </button>
            )}
        </div>
    );
}
