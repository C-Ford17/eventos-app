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

  useEffect(() => {
    if (isActive && !isScanning) {
      startScanner();
    } else if (!isActive && isScanning) {
      stopScanner();
    }

    return () => {
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [isActive]);

  const startScanner = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Usa cámara trasera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Escaneo exitoso
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error durante el escaneo (es normal, ocurre cuando no detecta QR)
          // No mostramos estos errores al usuario
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Error iniciando escáner:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      if (onScanError) {
        onScanError(err.message);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error deteniendo escáner:', err);
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
      <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
    </div>
  );
}
