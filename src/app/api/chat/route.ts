import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Usar modelo actual en lugar de gemini-pro obsoleto [web:6][web:9]
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Tipos mejorados
interface ChatMessage {
    conversacion_id: string;
    remitente_id: string;
    contenido: string;
    es_bot: boolean;
}

interface Usuario {
    id: string;
    nombre: string;
    tipo_usuario: string;
    email: string;
}

// GET - Obtener conversaciones del usuario
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const usuario_id = searchParams.get('usuario_id');
        const conversacion_id = searchParams.get('conversacion_id');
        const last_updated = searchParams.get('last_updated');

        if (!usuario_id) {
            return NextResponse.json(
                { error: 'usuario_id es requerido' },
                { status: 400 }
            );
        }

        // Caso 1: Polling ligero (Check de actualización)
        if (conversacion_id && last_updated) {
            const conversacion = await prisma.conversacion.findUnique({
                where: { id: conversacion_id },
                select: { updatedAt: true }
            });

            if (!conversacion) {
                return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
            }

            const lastUpdatedDate = new Date(last_updated).getTime();
            const currentUpdatedDate = new Date(conversacion.updatedAt).getTime();

            if (currentUpdatedDate <= lastUpdatedDate) {
                return NextResponse.json({ success: true, modified: false });
            }
            // Si hay cambios, continúa para devolver la conversación completa
        }

        // Caso 2: Obtener conversación específica (o polling con cambios)
        if (conversacion_id) {
            const conversacion = await prisma.conversacion.findUnique({
                where: { id: conversacion_id },
                include: {
                    mensajes: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            remitente: {
                                select: { id: true, nombre: true, tipo_usuario: true }
                            }
                        }
                    },
                    usuario: {
                        select: { id: true, nombre: true, email: true, tipo_usuario: true }
                    },
                    admin: {
                        select: { id: true, nombre: true }
                    }
                }
            });

            if (!conversacion || conversacion.usuario_id !== usuario_id) {
                return NextResponse.json(
                    { error: 'Conversación no encontrada' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, modified: true, conversacion });
        }

        // Caso 3: Carga inicial inteligente
        // Buscar la última conversación activa para devolverla completa
        const ultimaConversacion = await prisma.conversacion.findFirst({
            where: {
                usuario_id,
                estado: { not: 'cerrada' }
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                mensajes: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        remitente: {
                            select: { id: true, nombre: true, tipo_usuario: true }
                        }
                    }
                },
                usuario: {
                    select: { id: true, nombre: true, email: true, tipo_usuario: true }
                },
                admin: {
                    select: { id: true, nombre: true }
                }
            }
        });

        if (ultimaConversacion) {
            return NextResponse.json({
                success: true,
                conversacion: ultimaConversacion,
                active_found: true
            });
        }

        // Si no hay activa, devolver historial básico (sin mensajes pesados)
        const conversaciones = await prisma.conversacion.findMany({
            where: { usuario_id },
            include: {
                mensajes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                admin: {
                    select: { id: true, nombre: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ success: true, conversaciones, active_found: false });
    } catch (error) {
        console.error('Error obteniendo conversaciones:', error);
        return NextResponse.json(
            { error: 'Error al obtener conversaciones' },
            { status: 500 }
        );
    }
}

// POST - Enviar mensaje y obtener respuesta del bot
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { usuario_id, conversacion_id, mensaje } = body;

        if (!usuario_id || !mensaje) {
            return NextResponse.json(
                { error: 'usuario_id y mensaje son requeridos' },
                { status: 400 }
            );
        }

        // Obtener información del usuario
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuario_id },
            select: {
                id: true,
                nombre: true,
                tipo_usuario: true,
                email: true
            }
        });

        if (!usuario) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        let conversacion;

        // Crear nueva conversación si no existe
        if (!conversacion_id) {
            conversacion = await prisma.conversacion.create({
                data: {
                    usuario_id,
                    estado: 'bot',
                    contexto: {
                        tipo_usuario: usuario.tipo_usuario,
                        nombre: usuario.nombre
                    }
                },
                include: {
                    mensajes: {
                        orderBy: { createdAt: 'asc' },
                        take: 10
                    }
                }
            });
        } else {
            conversacion = await prisma.conversacion.findUnique({
                where: { id: conversacion_id },
                include: {
                    mensajes: {
                        orderBy: { createdAt: 'asc' },
                        take: 10
                    }
                }
            });

            if (!conversacion) {
                return NextResponse.json(
                    { error: 'Conversación no encontrada' },
                    { status: 404 }
                );
            }
        }

        // Guardar mensaje del usuario
        const mensajeUsuario = await prisma.mensaje.create({
            data: {
                conversacion_id: conversacion.id,
                remitente_id: usuario_id,
                contenido: mensaje,
                es_bot: false
            }
        });

        // Si está en modo humano, no gener respuesta automática
        if (conversacion.estado === 'humano') {
            return NextResponse.json({
                success: true,
                conversacion_id: conversacion.id,
                mensaje: mensajeUsuario,
                respuesta_bot: null,
                modo: 'humano'
            });
        }

        // Construir historial de conversación
        const historial = conversacion.mensajes?.map(m =>
            `${m.es_bot ? 'Asistente' : 'Usuario'}: ${m.contenido}`
        ).join('\n') || '';

        const prompt = `Eres un asistente virtual para "Eventos App".

Contexto del usuario:
- Nombre: ${usuario.nombre}
- Tipo: ${usuario.tipo_usuario}
- Email: ${usuario.email}

Historial:
${historial}

Usuario: ${mensaje}

Instrucciones:
1. Responde amable y profesionalmente
2. Ayuda según el tipo de usuario (organizador/asistente/proveedor)
3. Para temas específicos/técnicos, sugiere soporte humano
4. Máximo 3 párrafos
5. Detecta frustración y ofrece ayuda humana

Asistente:`;

        // Generar respuesta con Gemini
        const result = await model.generateContent(prompt);
        const respuestaBot = result.response.text();

        // Detectar si requiere escalamiento humano
        const requiereHumano = detectarEscalamientoHumano(mensaje, respuestaBot);

        // Guardar respuesta del bot
        const mensajeBot = await prisma.mensaje.create({
            data: {
                conversacion_id: conversacion.id,
                remitente_id: usuario_id,
                contenido: respuestaBot,
                es_bot: true
            }
        });

        // Actualizar conversación si requiere humano
        if (requiereHumano) {
            await prisma.conversacion.update({
                where: { id: conversacion.id },
                data: { requiere_humano: true }
            });
        }

        return NextResponse.json({
            success: true,
            conversacion_id: conversacion.id,
            mensaje: mensajeUsuario,
            respuesta_bot: mensajeBot,
            requiere_humano: requiereHumano
        });

    } catch (error) {
        console.error('Error en chat:', error);
        return NextResponse.json(
            { error: 'Error al procesar mensaje' },
            { status: 500 }
        );
    }
}

// Función para detectar escalamiento humano
function detectarEscalamientoHumano(mensajeUsuario: string, respuestaBot: string): boolean {
    const palabrasClave = [
        'hablar con una persona',
        'hablar con alguien',
        'soporte humano',
        'atención al cliente',
        'no entiendo',
        'no funciona',
        'error',
        'problema',
        'ayuda urgente',
        'no puedo'
    ];

    const mensajeLower = mensajeUsuario.toLowerCase();
    const respuestaLower = respuestaBot.toLowerCase();

    if (palabrasClave.some(palabra => mensajeLower.includes(palabra))) {
        return true;
    }

    if (respuestaLower.includes('contactar') || respuestaLower.includes('soporte humano')) {
        return true;
    }

    return false;
}
