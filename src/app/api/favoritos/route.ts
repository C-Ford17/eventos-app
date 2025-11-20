import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener favoritos del usuario
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const usuario_id = searchParams.get('usuario_id');

        if (!usuario_id) {
            return NextResponse.json({ error: 'usuario_id es requerido' }, { status: 400 });
        }

        const favoritos = await prisma.favorito.findMany({
            where: { usuario_id },
            include: {
                evento: {
                    include: {
                        categoria: true,
                        organizador: {
                            select: {
                                nombre: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, favoritos });
    } catch (error) {
        console.error('Error obteniendo favoritos:', error);
        return NextResponse.json({ error: 'Error al obtener favoritos' }, { status: 500 });
    }
}

// POST - Agregar favorito
export async function POST(req: Request) {
    try {
        const { usuario_id, evento_id } = await req.json();

        if (!usuario_id || !evento_id) {
            return NextResponse.json({ error: 'usuario_id y evento_id son requeridos' }, { status: 400 });
        }

        // Verificar si ya existe
        const existente = await prisma.favorito.findFirst({
            where: {
                usuario_id,
                evento_id,
            },
        });

        if (existente) {
            return NextResponse.json({ error: 'El evento ya está en favoritos' }, { status: 400 });
        }

        const favorito = await prisma.favorito.create({
            data: {
                usuario_id,
                evento_id,
            },
        });

        return NextResponse.json({ success: true, favorito }, { status: 201 });
    } catch (error) {
        console.error('Error agregando favorito:', error);
        return NextResponse.json({ error: 'Error al agregar favorito' }, { status: 500 });
    }
}

// DELETE - Quitar favorito
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const usuario_id = searchParams.get('usuario_id');
        const evento_id = searchParams.get('evento_id');

        if (!usuario_id || !evento_id) {
            return NextResponse.json({ error: 'usuario_id y evento_id son requeridos' }, { status: 400 });
        }

        await prisma.favorito.deleteMany({
            where: {
                usuario_id,
                evento_id,
            },
        });

        return NextResponse.json({ success: true, message: 'Favorito eliminado' });
    } catch (error) {
        console.error('Error eliminando favorito:', error);
        return NextResponse.json({ error: 'Error al eliminar favorito' }, { status: 500 });
    }
}
