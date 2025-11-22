import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET - Obtener conversaciones del usuario
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const usuario_id = searchParams.get('usuario_id');
        const conversacion_id = searchParams.get('conversacion_id');

        if (!usuario_id) {
            return NextResponse.json(
                { error: 'usuario_id es requerido' },
                { status: 400 }
            );
        }

        // Si se solicita una conversación específica
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

            return NextResponse.json({ success: true, conversacion });
        }

        // Obtener todas las conversaciones del usuario
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

        return NextResponse.json({ success: true, conversaciones });
    } catch (error: any) {
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

        // Obtener información del usuario para contexto
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

        // Si no hay conversación, crear una nueva
        if (!conversacion_id) {
            conversacion = await prisma.conversacion.create({
                data: {
                    usuario_id,
                    estado: 'bot',
                    contexto: {
                        tipo_usuario: usuario.tipo_usuario,
                        nombre: usuario.nombre
                    }
                }
            });
        } else {
            conversacion = await prisma.conversacion.findUnique({
                where: { id: conversacion_id },
                include: {
                    mensajes: {
                        orderBy: { createdAt: 'asc' },
                        take: 10 // Últimos 10 mensajes para contexto
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

        // Si la conversación está en modo humano, no generar respuesta automática
        if (conversacion.estado === 'humano') {
            return NextResponse.json({
                success: true,
                conversacion_id: conversacion.id,
                mensaje: mensajeUsuario,
                const prompt = `Eres un asistente virtual para una plataforma de gestión de eventos llamada "Eventos App".

Contexto del usuario:
- Nombre: ${usuario.nombre}
- Tipo de usuario: ${usuario.tipo_usuario}
- Email: ${usuario.email}

Historial de conversación:
${historial}

Usuario: ${mensaje}

Instrucciones:
1. Responde de manera amable y profesional
2. Si el usuario es organizador, ayúdalo con la creación y gestión de eventos
3. Si el usuario es asistente, ayúdalo con reservas y búsqueda de eventos
4. Si el usuario es proveedor, ayúdalo con la gestión de servicios
5. Si la pregunta es muy específica o técnica, sugiere contactar con soporte humano
6. Mantén las respuestas concisas (máximo 3 párrafos)
7. Si detectas frustración o un problema complejo, indica que un humano puede ayudar mejor

Asistente:`;

                const result = await model.generateContent(prompt);
                const respuestaBot = result.response.text();

                // Detectar si se requiere escalamiento a humano
                const requiereHumano = detectarEscalamientoHumano(mensaje, respuestaBot);

                // Guardar respuesta del bot
                const mensajeBot = await prisma.mensaje.create({
                    data: {
                        conversacion_id: conversacion.id,
                        remitente_id: usuario_id, // El bot usa el ID del usuario como remitente
                        contenido: respuestaBot,
                        es_bot: true
                    }
                });

                // Actualizar conversación si requiere humano
                if(requiereHumano) {
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
                    requiere_humano
                });

            } catch (error: any) {
                console.error('Error en chat:', error);
                return NextResponse.json(
                    { error: 'Error al procesar mensaje' },
                    { status: 500 }
                );
            }
        }

        // Función para detectar si se requiere escalamiento a humano
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

            // Si el usuario pide explícitamente hablar con humano
            if (palabrasClave.some(palabra => mensajeLower.includes(palabra))) {
                return true;
            }

            // Si el bot sugiere contactar soporte
            if (respuestaLower.includes('contactar') || respuestaLower.includes('soporte humano')) {
                return true;
            }

            return false;
        }
