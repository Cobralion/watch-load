import * as jose from 'jose';
import { createSignature } from '@/lib/withings/signing';
import { prisma } from '@/lib/prisma';
import { WithingsConnection } from '@/generated/prisma/client';
import { env } from '@/env/server';
import {
    WITHINGS_AUTHORIZATION_URL,
    WITHINGS_OAUTH_URL,
} from '@/lib/withings/api-urls';

export async function getWithingsAuthUrl(
    workspaceId: string,
    userId: string,
    mode: string = ''
) {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: env.WITHINGS_CLIENT_ID,
        redirect_uri: env.WITHINGS_REDIRECT_URI,
        scope: 'user.metrics,user.activity',
        state: await createStateJWT(workspaceId, userId),
        mode: mode,
    });

    return `${WITHINGS_AUTHORIZATION_URL}?${params.toString()}`;
}

type JWTPayload = { workspaceId: string; userId: string };

export async function createStateJWT(
    workspaceId: string,
    userId: string
): Promise<string> {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const alg = 'HS256';
    const data = { workspaceId: workspaceId, userId: userId };

    return await new jose.SignJWT(data)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer(env.JWT_APP_ISSUER)
        .setAudience(env.JWT_APP_AUDIENCE)
        .setExpirationTime('5min')
        .sign(secret);
}

// TODO: Verify state against a stored value to eliminate CSRF
export async function verifyStateJWT(jwt: string): Promise<JWTPayload | null> {
    const secret = new TextEncoder().encode(env.JWT_SECRET);

    try {
        const { payload } = await jose.jwtVerify(jwt, secret, {
            issuer: env.JWT_APP_ISSUER!,
            audience: env.JWT_APP_AUDIENCE!,
        });

        return payload as JWTPayload;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

// TODO: add support for multiple device connections per workspace and revoke only the relevant one instead of all connections
export async function disconnectDevice(
    withingsConnection: WithingsConnection,
    workspaceId: string
): Promise<boolean> {
    try {
        const sig = await createSignature('revoke');

        const fetchResult = await fetch(WITHINGS_OAUTH_URL, {
            method: 'POST',
            body: new URLSearchParams({
                action: 'revoke',
                client_id: env.WITHINGS_CLIENT_ID,
                nonce: sig.nonce,
                signature: sig.signature,
                userid: String(withingsConnection.withingsUserId),
            }),
        });

        if (!fetchResult.ok) {
            const errorText = await fetchResult.text();
            throw new Error(
                `Failed to revoke signature. HTTP status: ${fetchResult.status}, Response: ${errorText}`
            );
        }

        const { status } = await fetchResult.json();
        if (status !== 0) {
            throw new Error(
                `Failed to revoke signature. Withings API status code: ${status}`
            );
        }
    } catch (e) {
        console.error('Remote Withings API token revocation failed:', e);
    }

    try {
        await prisma.withingsConnection.deleteMany({
            where: { workspaceId: workspaceId },
        });
        return true;
    } catch (err) {
        console.error(
            'Failed to disconnect device locally in the database:',
            err
        );
        return false;
    }
}
