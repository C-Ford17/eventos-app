import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // Para asegurar que no se cachee

export async function GET(req: Request) {
    try {
        // Calcular la fecha límite (hace 5 minutos)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Buscar reservas pendientes antiguas
        const reservasPendientes = await prisma.reserva.findMany({
            where: {
                estado_reserva: 'pendiente',
                createdAt: {
                    lt: fiveMinutesAgo,
                },
            },
        });

        console.log(`🔍 Encontradas ${reservasPendientes.length} reservas pendientes antiguas.`);

        const resultados = [];

        for (const reserva of reservasPendientes) {
            try {
                // Actualizar reserva a rechazada
                await prisma.reserva.update({
                    where: { id: reserva.id },
                    data: { estado_reserva: 'rechazada' },
                });

                // Actualizar todos los pagos asociados a rejected
                await prisma.pago.updateMany({
                    where: { reserva_id: reserva.id },
                    data: { estado_transaccion: 'rejected' },
                });

                resultados.push({
                    reservaId: reserva.id,
                    status: 'rechazado',
                });

                console.log(`✅ Reserva ${reserva.id} marcada como rechazada automáticamente.`);
            } catch (innerError) {
                console.error(`❌ Error actualizando reserva ${reserva.id}:`, innerError);
                resultados.push({
                    reservaId: reserva.id,
                    error: 'Error actualizando',
                });
            }
        }

        return NextResponse.json({
            success: true,
            procesados: resultados.length,
            detalles: resultados,
        });
    } catch (error) {
        console.error('❌ Error en cron job de limpieza:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
