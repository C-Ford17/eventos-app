import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        // Contar conversaciones que requieren atención humana
        const pendingCount = await prisma.conversacion.count({
            where: {
                OR: [
                    { requiere_humano: true },
                    { estado: 'humano' }
                ]
            }
        });

        return NextResponse.json({ success: true, pendingCount });
    } catch (error) {
        console.error('Error obteniendo estado del chat:', error);
        return NextResponse.json(
            { error: 'Error al obtener estado' },
            { status: 500 }
        );
    }
}
