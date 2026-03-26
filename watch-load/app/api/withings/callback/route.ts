import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyStateJWT } from '@/lib/withings/oauth';
import { encryptToken } from '@/lib/encryption';
import { RequestTokenResponse } from '@/types/withings';
import { disconnectDevice } from '@/lib/withings/oauth';
import { auth } from '@/lib/auth';
import { env } from '@/env/server';
import { WITHINGS_TOKEN_URL } from '@/lib/withings/api-urls';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');

    if (!code || !state) {
        return new Response('Missing code or state.', { status: 400 });
    }

    const userId = await verifyStateJWT(state);

    if (!userId || userId !== session.user.id) {
        return new Response('User verification failed.', { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId! },
        select: { id: true },
    });

    if (!user) {
        return new Response('Invalid user', { status: 400 });
    }

    // Check if there is already a connected device
    const existingDevice = await prisma.withingsDevice.findFirst({
        where: { user_id: user.id },
    });

    if (existingDevice) {
        const result = await disconnectDevice(existingDevice, user.id);
        if (!result) {
            return new Response('Failed to revoke old connection.', {
                status: 400,
            });
        }
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(WITHINGS_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'requesttoken',
            client_id: env.WITHINGS_CLIENT_ID,
            client_secret: env.WITHINGS_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: env.WITHINGS_REDIRECT_URI,
        }),
    });

    if (!tokenResponse.ok) {
        console.error(
            'Failed to exchange code for tokens:',
            await tokenResponse.text()
        );
        return new Response('Failed to exchange code for tokens', {
            status: 502,
        });
    }

    const { status, body }: RequestTokenResponse = await tokenResponse.json();

    if (status !== 0) {
        console.error(
            'Failed to exchange code for tokens: Response status was ' + status
        );
        return new Response('Failed to exchange code for tokens.', {
            status: 502,
        });
    }

    const expiresAt = new Date(Date.now() + body.expires_in * 1000);

    try {
        // Create device and link to user atomically
        const device = await prisma.withingsDevice.create({
            data: {
                user_id: user.id,
                access_token: encryptToken(body.access_token),
                refresh_token: encryptToken(body.refresh_token),
                expires_at: expiresAt,
                withings_user_id: body.userid,
            },
        });
    } catch (err) {
        console.error('Failed to save Withings device:', err);
        return new Response('Internal server error', { status: 500 });
    }

    return NextResponse.redirect(new URL('/conected-devices', req.url));
}
