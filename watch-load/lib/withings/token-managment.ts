import { prisma } from '@/lib/prisma';
import { RefreshTokenError } from '@/types/errors';
import { WITHINGS_OAUTH_URL } from '@/lib/withings/api-urls';
import { env } from '@/env';
import { createSignature } from '@/lib/withings/signing';
import { decryptToken, encryptToken } from '@/lib/encryption';

type RefreshedTokens = {
    access_token: string;
    refresh_token: string;
};

export async function refreshWithingsToken(
    userId: string
): Promise<RefreshedTokens> {
    let deviceConnection:
        | { id: string; refresh_token: string }
        | null
        | undefined;
    try {
        deviceConnection = await prisma.withingsDevice.findFirst({
            where: { user_id: userId },
            select: { id: true, refresh_token: true },
        });
    } catch (err) {
        const message = (err as Error).message ?? String(err);
        throw new RefreshTokenError(
            'Failed to query database for refresh token: ' + message
        );
    }

    if (
        !deviceConnection ||
        !deviceConnection.id ||
        !deviceConnection.refresh_token
    ) {
        throw new RefreshTokenError("Can't find a device connection");
    }

    const refresh_token = decryptToken(deviceConnection.refresh_token); // throw decryption error

    let response: Response;
    try {
        const action = 'requesttoken';
        const sig = await createSignature(action);
        response = await fetch(WITHINGS_OAUTH_URL, {
            method: 'POST',
            body: new URLSearchParams({
                action: action,
                client_id: env.WITHINGS_CLIENT_ID,
                nonce: sig.nonce,
                signature: sig.signature,
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
            }),
        });
    } catch (err) {
        const message = (err as Error).message ?? String(err);
        throw new RefreshTokenError(
            'Failed to retrieve new access_token from Withings API: ' + message
        );
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new RefreshTokenError(
            'Failed to retrieve new access_token from Withings API: ' +
                errorText
        );
    }

    const { status, body } = await response.json();

    if (status !== 0) {
        throw new RefreshTokenError(
            `Failed to retrieve new access_token from Withings API: Status was  ${status}, body was  ${JSON.stringify(body)}`
        );
    }

    const expiresAt = new Date(Date.now() + body.expires_in * 1000);

    try {
        // Update device connection
        await prisma.withingsDevice.update({
            where: { id: deviceConnection.id },
            data: {
                access_token: encryptToken(body.access_token),
                refresh_token: encryptToken(body.refresh_token),
                expires_at: expiresAt,
            },
        });
    } catch (err) {
        const message = (err as Error).message ?? String(err);
        throw new RefreshTokenError(
            'Failed to save new access_token from Withings API to database: ' +
                message
        );
    }

    return {
        access_token: body.access_token,
        refresh_token: body.refresh_token,
    };
}
