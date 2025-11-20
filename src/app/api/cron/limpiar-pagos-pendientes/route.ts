import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // Para asegurar que no se cachee

export async function GET(req: Request) {
    try {
        // Calcular la fecha límite (hace 5 minutos)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Buscar pagos pendientes antiguos
        const pagosPendientes = await prisma.pago.findMany({
            where: {
                estado_transaccion: 'pendiente',
                createdAt: {
                    lt: fiveMinutesAgo,
                },
            },
            include: {
                reserva: true,
            },
        });

        console.log(`Encontrados ${pagosPendientes.length} pagos pendientes antiguos.`);

        const resultados = [];

        for (const pago of pagosPendientes) {
            try {
                // Actualizar pago a rechazado
                await prisma.pago.update({
                    where: { id: pago.id },
                    data: { estado_transaccion: 'rejected' },
                });

                // Actualizar reserva a rechazada
                await prisma.reserva.update({
                    where: { id: pago.reserva_id },
                    data: { estado_reserva: 'rechazada' },
                });

                resultados.push({
                    pagoId: pago.id,
                    reservaId: pago.reserva_id,
                    status: 'rechazado',
                });
            } catch (innerError) {
                console.error(`Error actualizando pago ${pago.id}:`, innerError);
                resultados.push({
                    pagoId: pago.id,
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
        console.error('Error en cron job de limpieza:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
