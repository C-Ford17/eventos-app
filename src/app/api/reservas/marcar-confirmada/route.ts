import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const metodoNombre: Record<string, string> = {
  "credit_card": "Tarjeta de crédito",
  "debit_card": "Tarjeta de débito",
  "account_money": "Dinero en cuenta",
  "bank_transfer": "Transferencia bancaria",
  "pix": "Pix",
};

function normalizarMetodoPago(metodo: string | null | undefined): string {
  if (!metodo) return "Desconocido";
  const metodoLower = metodo.toLowerCase();
  return metodoNombre[metodoLower] || metodo; // Si no, devuelve el original
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    console.log("❗️Reserva confirmada llamada con datos:", json);
    const { reservaId, paymentId, metodoPago, estado } = json;

    if (!reservaId || !estado) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Actualiza la reserva (estado y método de pago)
    const metodoNormalizado = normalizarMetodoPago(metodoPago);
    const reservaActualizada = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        estado_reserva: estado === 'approved' ? 'confirmada' : 'pendiente',
        metodo_pago: metodoNormalizado || 'No especificado' // ← AGREGA ESTA LÍNEA
      }
    });

    // Actualiza todos los pagos asociados
    const pagosActualizados = await prisma.pago.updateMany({
      where: { reserva_id: reservaId },
      data: {
        referencia_externa: String(paymentId),
        metodo_pago: metodoNormalizado || 'No especificado',
        estado_transaccion: estado,
      }
    });

    return NextResponse.json({ 
      success: true, 
      reserva: reservaActualizada, 
      pagos: pagosActualizados 
    });
  } catch (error : any) {
    console.error("❌ Error marcando confirmada:", error);
    return NextResponse.json({ 
      error: 'Error al confirmar reserva', 
      details: error.message 
    }, { status: 500 });
  }
}

