'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActionStates } from '@/types/action-states';
import { disconnectDevice } from '@/lib/withings/oauth';

async function disconnectDevices(): Promise<ActionStates> {
    const session = await auth();
    if (!session) {
        return { success: false, message: 'User not authenticated.' };
    }

    const deviceConnection = await prisma.withingsDevice.findFirst({
        where: { user_id: session.user.id },
    });

    if (!deviceConnection) {
        return { success: false, message: 'No device connection found.' };
    }

    const result = await disconnectDevice(deviceConnection, session.user.id);

    if (result) {
        return { success: true, message: 'Device disconnected.' };
    } else {
        return { success: false, message: 'Device disconnection failed.' };
    }
}

export { disconnectDevices };
