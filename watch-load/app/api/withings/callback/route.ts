import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyStateJWT } from '@/lib/withings/oauth';
import { encryptToken } from '@/lib/encryption';
import { RequestTokenResponse } from '@/types/withings';
import { disconnectDevice } from '@/lib/withings/oauth';
import { env } from '@/env/server';
import { WITHINGS_OAUTH_URL } from '@/lib/withings/api-urls';
import { resolveWorkspaceRawNoAuthFromId } from '@/lib/workspace';
import { createSignature } from '@/lib/withings/signing';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.redirect(new URL(`/login`, req.url));
    }

    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');

    if (!code || !state) {
        return new Response('Bad Request', { status: 400 });
    }

    const payload = await verifyStateJWT(state);

    if (!payload) {
        return new Response('Forbidden', { status: 403 });
    }

    const result = await resolveWorkspaceRawNoAuthFromId(
        session.user.id,
        session.user.role,
        payload.workspaceId
    ); // TODO: use id instead of slug
    if (result instanceof NextResponse) {
        return result;
    }

    const {
        workspace: { slug },
        role,
    } = result;

    if (role !== 'ADMIN') return new Response('Forbidden', { status: 403 });

    // Check if there is already a connected device
    const existingDevice = await prisma.withingsConnection.findFirst({
        where: { workspaceId: payload.workspaceId },
    });

    if (existingDevice) {
        const result = await disconnectDevice(
            existingDevice,
            payload.workspaceId
        );
        if (!result) {
            return new Response('Failed to revoke old connection.', {
                status: 400,
            });
        }
    }

    let tokenResponse: Response;
    try {
        const action = 'requesttoken';
        const sig = await createSignature(action);
        tokenResponse = await fetch(WITHINGS_OAUTH_URL, {
            method: 'POST',
            body: new URLSearchParams({
                action: action,
                client_id: env.WITHINGS_CLIENT_ID,
                nonce: sig.nonce,
                signature: sig.signature,
                grant_type: 'authorization_code',
                code,
                redirect_uri: env.WITHINGS_REDIRECT_URI,
            }),
        });
    } catch (err) {
        console.error(err);
        return new Response('Failed to exchange code for tokens', {
            status: 502,
        });
    }

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
        // Create device and link to workspace
        await prisma.withingsConnection.create({
            data: {
                workspaceId: payload.workspaceId,
                accessToken: encryptToken(body.access_token),
                refreshToken: encryptToken(body.refresh_token),
                expiresAt: expiresAt,
                withingsUserId: body.userid,
            },
        });
    } catch (err) {
        console.error('Failed to save Withings device:', err);
        return new Response('Internal server error', { status: 500 });
    }

    return NextResponse.redirect(
        new URL(`/workspace/${slug}/connected-devices`, req.url)
    );
}
