import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const appId = process.env.MERCADOPAGO_APP_ID;
    // The redirect URI must match what is configured in your Mercado Pago Application
    const redirectUri = `${process.env.APP_URL}/api/mercadopago/callback`;

    // State is used to pass the userId through the OAuth flow so we know who to link
    // In a production app, this should be a secure random string associated with the user session
    // to prevent CSRF, but for this implementation we'll pass the userId directly (or a signed token).
    // For simplicity here, we pass userId.
    const state = userId;

    const authUrl = `https://auth.mercadopago.com/authorization?client_id=${appId}&response_type=code&platform_id=mp&state=${state}&redirect_uri=${redirectUri}`;

    return NextResponse.json({ url: authUrl });
}
