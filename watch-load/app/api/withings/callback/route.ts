'use server';

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const WITHINGS_TOKEN_URL = 'https://wbsapi.withings.net/v2/oauth2';

interface WithingsTokenBody {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');

    if (!code || !state) {
        return new Response('Missing code or state', { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { id: state },
        select: { id: true },
    });

    if (!user) {
        return new Response('Invalid user', { status: 400 });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(WITHINGS_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'requesttoken',
            client_id: process.env.WITHINGS_CLIENT_ID!,
            client_secret: process.env.WITHINGS_CLIENT_SECRET!,
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.WITHINGS_REDIRECT_URI!,
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

    const { body }: { body: WithingsTokenBody } = await tokenResponse.json();

    const expiresAt = new Date(Date.now() + body.expires_in * 1000);

    try {
        // Create device and link to user atomically
        await prisma.$transaction(async (tx) => {
            const device = await tx.withingsDevice.create({
                data: {
                    userId: user.id,
                    access_token: body.access_token,
                    refresh_token: body.refresh_token,
                    expires_at: expiresAt,
                },
            });

            await tx.user.update({
                where: { id: user.id },
                data: { devices: { connect: { id: device.id } } },
            });
        });
    } catch (err) {
        console.error('Failed to save Withings device:', err);
        return new Response('Internal server error', { status: 500 });
    }

    return NextResponse.redirect(new URL('/conected-devices', req.url));
}
