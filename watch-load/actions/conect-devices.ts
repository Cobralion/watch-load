'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWithingsAuthUrl } from '@/lib/withings/oauth';
import { ActionState } from '@/types/action-state';

async function disconnectDevices(): Promise<ActionState> {
    const session = await auth();
    if (!session) {
        return { success: false, message: 'User not authenticated.' };
    }

    // TODO: Revoke Withings access token if stored, currently we just delete the devices from our database. Implementing token revocation would require storing the access token securely and then making a request to Withings API to revoke it.
    const fetchResult = await fetch('https://wbsapi.withings.net/v2/oauth2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'revoke',
        }),
    });
    try {
        await prisma.withingsDevice.deleteMany({
            where: { userId: session.user.id },
        });
        return { success: true, message: 'Devices disconnected successfully.' };
    } catch (err) {
        console.error('Failed to disconnect devices:', err);
        return { success: false, message: 'Failed to disconnect devices.' };
    }
}

export { disconnectDevices };
