'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActionState } from '@/types/action-state';

async function disconnectDevices(): Promise<ActionState> {
    const session = await auth();
    if (!session) {
        return { success: false, message: 'User not authenticated.' };
    }

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
