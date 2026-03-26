import { decryptToken } from '@/lib/encryption';
import { refreshWithingsToken } from '@/lib/withings/token-managment';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getAccessToken(
    userId: string
): Promise<string | undefined> {
    try {
        const token = await prisma.withingsDevice.findFirst({
            where: { user_id: userId },
            select: { access_token: true, expires_at: true },
        });

        if (!token) {
            return undefined;
        }

        let accessToken = decryptToken(token.access_token);
        if (token.expires_at <= new Date()) {
            accessToken = (await refreshWithingsToken(userId)).access_token;
        }
        return accessToken;
    } catch (error) {
        console.error('Error fetching access token:', error);
        return undefined;
    }
}
