import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const usuario_id = searchParams.get('usuario_id');

        if (!usuario_id) {
            return NextResponse.json(
                { error: 'Usuario ID es requerido' },
                { status: 400 }
            );
        }

        // 1. Buscar las reservas rechazadas
        const reservasRechazadas = await prisma.reserva.findMany({
            where: {
                asistente_id: usuario_id,
                estado_reserva: 'rechazada',
            },
            select: { id: true }
        });

        const idsReservas = reservasRechazadas.map(r => r.id);

        if (idsReservas.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No hay reservas rechazadas para eliminar',
                count: 0,
            });
        }

        // 2. Eliminar en orden respetando las restricciones (FK)
        const result = await prisma.$transaction([
            // Eliminar credenciales de acceso asociadas
            prisma.credencialAcceso.deleteMany({
                where: {
                    reserva_id: { in: idsReservas }
                }
            }),
            // Eliminar pagos asociados
            prisma.pago.deleteMany({
                where: {
                    reserva_id: { in: idsReservas }
                }
            }),
            // Eliminar reembolsos asociados (si existen)
            prisma.reembolso.deleteMany({
                where: {
                    reserva_id: { in: idsReservas }
                }
            }),
            // Finalmente eliminar las reservas
            prisma.reserva.deleteMany({
                where: {
                    id: { in: idsReservas }
                }
            })
        ]);

        // El resultado de deleteMany es el último del array (la eliminación de reservas)
        const deletedCount = result[3].count;

        return NextResponse.json({
            success: true,
            message: `Se eliminaron ${deletedCount} reservas rechazadas`,
            count: deletedCount,
        });
    } catch (error) {
        console.error('Error eliminando reservas:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
