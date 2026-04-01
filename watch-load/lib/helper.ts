import { decryptToken } from '@/lib/encryption';
import { refreshWithingsToken } from '@/lib/withings/token-managment';
import { prisma } from '@/lib/prisma';

export async function getAccessToken(
    workspaceId: string
): Promise<string | undefined> {
    try {
        const token = await prisma.withingsConnection.findFirst({
            where: { workspaceId: workspaceId },
            select: { accessToken: true, expiresAt: true },
        });

        if (!token) {
            return undefined;
        }

        let accessToken = decryptToken(token.accessToken);
        if (token.expiresAt <= new Date()) {
            accessToken = (await refreshWithingsToken(workspaceId)).accessToken;
        }
        return accessToken;
    } catch (error) {
        console.error('Error fetching access token:', error);
        return undefined;
    }
}
