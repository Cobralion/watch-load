import { prisma } from '@/lib/prisma';
import { RefreshTokenError } from '@/types/errors';
import { WITHINGS_OAUTH_URL } from '@/lib/withings/api-urls';
import { env } from '@/env';
import { createSignature } from '@/lib/withings/signing';
import { decryptToken, encryptToken } from '@/lib/encryption';

type RefreshedTokens = {
    accessToken: string;
    refreshToken: string;
};

// TODO: lock so that only one party can refresh at a time
export async function refreshWithingsToken(
    workspaceId: string
): Promise<RefreshedTokens> {
    let connection:
        | { id: string; refreshToken: string }
        | null
        | undefined;
    try {
        // TODO: add support for multiple connections
        connection = await prisma.withingsConnection.findFirst({
            where: { workspaceId: workspaceId },
            select: { id: true, refreshToken: true },
        });
    } catch (err) {
        const message = (err as Error).message ?? String(err);
        throw new RefreshTokenError(
            'Failed to query database for refresh token: ' + message
        );
    }

    if (
        !connection ||
        !connection.id ||
        !connection.refreshToken
    ) {
        throw new RefreshTokenError("Can't find a device connection");
    }

    const refreshToken = decryptToken(connection.refreshToken); // throw decryption error

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
                refresh_token: refreshToken,
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

    // TODO: check for specific error codes like expired refresh token
    if (status !== 0) {
        throw new RefreshTokenError(
            `Failed to retrieve new access_token from Withings API: Status was  ${status}, body was  ${JSON.stringify(body)}`
        );
    }

    const expiresAt = new Date(Date.now() + body.expires_in * 1000 - 60000);

    try {
        // Update device connection
        await prisma.withingsConnection.update({
            where: { id: connection.id },
            data: {
                accessToken: encryptToken(body.access_token),
                refreshToken: encryptToken(body.refresh_token),
                expiresAt: expiresAt,
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
        accessToken: body.access_token,
        refreshToken: body.refresh_token,
    };
}
