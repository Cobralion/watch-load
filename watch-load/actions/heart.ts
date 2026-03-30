'use server';

import { syncHeartData } from '@/lib/withings/heart';
import { auth } from '@/lib/auth';
import { SyncHeartActionState } from '@/types/action-states';
import { NoAccessTokenError } from '@/types/errors';

export async function syncHeartAction(): Promise<SyncHeartActionState> {
    const session = await auth();
    if (!session) {
        return { success: false, message: 'User authentication failed!' };
    }

    try {
        await syncHeartData(session.user.id);
    } catch (e) {
        console.error(e);
        if (e instanceof NoAccessTokenError) {
            return {
                success: false,
                message: 'No connected devices found! Please connect a device.',
            };
        } else {
            return {
                success: false,
                message: 'Failed to sync ECGs from connected Withings device!',
            };
        }
    }

    return { success: true };
}
