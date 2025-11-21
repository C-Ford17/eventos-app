import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the userId we passed
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${process.env.APP_URL}/dashboard/configuracion?error=${error}`);
    }

    if (!code || !state) {
        return NextResponse.redirect(`${process.env.APP_URL}/dashboard/configuracion?error=missing_params`);
    }

    const userId = state;

    try {
        const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
                client_id: process.env.MERCADOPAGO_APP_ID,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `${process.env.APP_URL}/api/mercadopago/callback`,
            }),
        });

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Error exchanging token:', data);
            return NextResponse.redirect(`${process.env.APP_URL}/dashboard/configuracion?error=token_exchange_failed`);
        }

        // Save tokens to user (Encrypted)
        await prisma.usuario.update({
            where: { id: userId },
            data: {
                mp_access_token: encrypt(data.access_token),
                mp_public_key: data.public_key,
                mp_refresh_token: encrypt(data.refresh_token),
                mp_user_id: String(data.user_id),
                mp_expires_in: data.expires_in,
            },
        });

        return NextResponse.redirect(`${process.env.APP_URL}/dashboard/configuracion?success=connected`);
    } catch (err) {
        console.error('Error in MP callback:', err);
        return NextResponse.redirect(`${process.env.APP_URL}/dashboard/configuracion?error=internal_error`);
    }
}
