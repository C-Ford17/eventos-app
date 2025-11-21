// src/lib/audit.ts
import { prisma } from '@/lib/prisma';

export async function createAuditLog(params: {
    usuario_id: string;
    accion: string;
    tabla: string;
    registro_id?: string;
    detalles?: string;
}) {
    try {
        await prisma.auditoria.create({
            data: {
                usuario_id: params.usuario_id,
                accion: params.accion,
                tabla: params.tabla,
                registro_id: params.registro_id,
                detalles: params.detalles,
            },
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        // No lanzar error para no interrumpir el flujo principal
    }
}
