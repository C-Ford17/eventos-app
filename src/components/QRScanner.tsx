// src/components/QRScanner.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
}

export default function QRScanner({ onScanSuccess, onScanError, isActive }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const initScanner = async () => {
      if (isActive && !isScanning && !scannerRef.current) {
        await startScanner();
      } else if (!isActive && scannerRef.current) {
        await stopScanner();
      }
    };

    initScanner();

    return () => {
      isMounted.current = false;
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [isActive]);

  const startScanner = async () => {
    if (scannerRef.current) {
      console.log('⚠️ Escáner ya existe');
      return;
    }

    try {
      setError(null);
      console.log('🎥 Iniciando escáner...');

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Cámara trasera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          console.log('✅ QR detectado:', decodedText);
          
          if (isMounted.current) {
            onScanSuccess(decodedText);
          }
        },
        (errorMessage) => {
          // Errores normales mientras busca QR - no mostrar
        }
      );

      if (isMounted.current) {
        setIsScanning(true);
        console.log('✅ Escáner iniciado correctamente');
      }
    } catch (err: any) {
      console.error('❌ Error iniciando escáner:', err);
      
      if (isMounted.current) {
        const errorMsg = 'No se pudo acceder a la cámara. Verifica los permisos.';
        setError(errorMsg);
        
        if (onScanError) {
          onScanError(err.message);
        }
      }
      
      scannerRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) {
      return;
    }

    try {
      console.log('🛑 Deteniendo escáner...');
      
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      
      await scannerRef.current.clear();
      scannerRef.current = null;
      
      if (isMounted.current) {
        setIsScanning(false);
        console.log('✅ Escáner detenido');
      }
    } catch (err) {
      console.error('❌ Error deteniendo escáner:', err);
      scannerRef.current = null;
      
      if (isMounted.current) {
        setIsScanning(false);
      }
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div 
        id="qr-reader" 
        className="w-full rounded-lg overflow-hidden border-2 border-blue-500"
        style={{ minHeight: '300px' }}
      ></div>
      
      {isScanning && (
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">
              Cámara activa - Centra el QR en el recuadro
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
