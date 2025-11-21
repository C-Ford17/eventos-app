// src/app/api/reportes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            tipo_reporte,
            categoria,
            descripcion,
            prioridad,
            reportante_id,
            evento_id,
            servicio_id,
            usuario_reportado_id,
        } = body;

        // Validaciones
        if (!tipo_reporte || !categoria || !descripcion || !reportante_id) {
            return NextResponse.json(
                { success: false, error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Validar que existe la entidad reportada según el tipo
        if (tipo_reporte === 'evento' && !evento_id) {
            return NextResponse.json(
                { success: false, error: 'evento_id es requerido para reportes de eventos' },
                { status: 400 }
            );
        }

        if (tipo_reporte === 'servicio' && !servicio_id) {
            return NextResponse.json(
                { success: false, error: 'servicio_id es requerido para reportes de servicios' },
                { status: 400 }
            );
        }

        if (tipo_reporte === 'usuario' && !usuario_reportado_id) {
            return NextResponse.json(
                { success: false, error: 'usuario_reportado_id es requerido para reportes de usuarios' },
                { status: 400 }
            );
        }

        // Crear el reporte
        const reporte = await prisma.reporte.create({
            data: {
                tipo_reporte,
                categoria,
                descripcion,
                prioridad: prioridad || 'media',
                reportante_id,
                evento_id: tipo_reporte === 'evento' ? evento_id : null,
                servicio_id: tipo_reporte === 'servicio' ? servicio_id : null,
                usuario_reportado_id: tipo_reporte === 'usuario' ? usuario_reportado_id : null,
            },
            include: {
                reportante: {
                    select: { nombre: true, email: true }
                },
                evento: {
                    select: { nombre: true }
                },
                servicio: {
                    select: { nombre: true }
                },
                usuario_reportado: {
                    select: { nombre: true, email: true }
                }
            }
        });

        // Crear notificación para admins
        const admins = await prisma.usuario.findMany({
            where: { tipo_usuario: 'admin' },
            select: { id: true }
        });

        if (admins.length > 0) {
            const notificacionesData = admins.map(admin => ({
                usuario_id: admin.id,
                tipo: 'nuevo_reporte',
                mensaje: `Nuevo reporte de ${tipo_reporte}: ${categoria}${prioridad === 'alta' || prioridad === 'critica' ? ' ⚠️ PRIORIDAD ' + prioridad.toUpperCase() : ''}`,
                leida: false,
            }));

            await prisma.notificacion.createMany({
                data: notificacionesData,
            });
        }

        // Registrar en auditoría
        await createAuditLog({
            usuario_id: reportante_id,
            accion: 'crear_reporte',
            tabla: 'reportes',
            registro_id: reporte.id,
            detalles: `Reporte de ${tipo_reporte} creado: ${categoria}`,
        });

        return NextResponse.json({
            success: true,
            message: 'Reporte enviado exitosamente. Será revisado por un administrador.',
            reporte,
        });
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json(
            { success: false, error: 'Error al crear reporte' },
            { status: 500 }
        );
    }
}
