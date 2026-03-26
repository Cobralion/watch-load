'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { refreshWithingsToken } from '@/lib/withings/token-managment';
import { listHeart } from '@/lib/withings/heart';
import { decryptToken } from '@/lib/encryption';

export async function listHeartAction(): Promise<void> {
    const session = await auth();
    if (!session) {
        return;
    }

    const token = await prisma.withingsDevice.findFirst({
        where: { user_id: session.user.id },
        select: { access_token: true, expires_at: true },
    });

    if (!token) {
        return;
    }

    let accessToken = decryptToken(token.access_token);
    if(token.expires_at <= new Date()) {
        accessToken = (await refreshWithingsToken(session.user.id)).access_token;
    }

    const result = await listHeart(accessToken);

    for (const item of result) {
        console.log(item.ecg.signalid);
    }
}
