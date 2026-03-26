'use server';

import { syncHeartData } from '@/lib/withings/heart';
import { auth } from '@/lib/auth';

export type SyncHeartActionState = {
    success: boolean;
    message?: string;
};

export async function syncHeartAction(): Promise<SyncHeartActionState> {
    const session = await auth();
    if (!session) {
        return { success: false, message: 'User authentication failed!' };
    }

    try {
        await syncHeartData(session.user.id);
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: 'Failed to sync ECGs from connected Withings device!',
        };
    }

    return { success: true };
}
