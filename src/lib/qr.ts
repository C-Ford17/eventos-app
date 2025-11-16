// src/lib/qr.ts
import QRCode from 'qrcode';

export interface QRData {
  reservaId: string;
  eventoId: string;
  usuarioId: string;
  fecha: string;
  tipo: string;
  hash: string; // Para validación de autenticidad
}

/**
 * Genera un código QR como Data URL (imagen base64)
 */
export async function generarQR(data: QRData): Promise<string> {
  try {
    const dataString = JSON.stringify(data);
    const qrDataURL = await QRCode.toDataURL(dataString, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generando QR:', error);
    throw new Error('No se pudo generar el código QR');
  }
}

/**
 * Genera un hash único para validación
 */
export function generarHashValidacion(reservaId: string, usuarioId: string): string {
  // En producción, usar una librería como crypto para hash más seguro
  const data = `${reservaId}-${usuarioId}-${process.env.QR_SECRET || 'secret-key'}`;
  return Buffer.from(data).toString('base64');
}

/**
 * Valida que el hash sea correcto
 */
export function validarHash(reservaId: string, usuarioId: string, hash: string): boolean {
  const expectedHash = generarHashValidacion(reservaId, usuarioId);
  return hash === expectedHash;
}

/**
 * Descarga el QR como imagen PNG
 */
export function descargarQRImagen(qrDataURL: string, nombreArchivo: string = 'boleto-qr.png') {
  const link = document.createElement('a');
  link.href = qrDataURL;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}