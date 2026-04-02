'use server';

import { syncHeartData } from '@/lib/withings/heart';
import { auth } from '@/lib/auth';
import {
    SyncHeartActionState,
    TrailsChangeActionState,
} from '@/types/action-states';
import { NoAccessTokenError } from '@/types/errors';
import { EcgData } from '@/components/dashboard/ecg-data-table';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function syncHeartAction(): Promise<SyncHeartActionState> {
    const session = await auth();
    if (!session) {
        return { success: false, message: 'User authentication failed!' };
    }

    try {
        await syncHeartData(workspaceId);
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

    revalidatePath('/dashboard');
    return { success: true };
}

export async function editTrailsId(
    ecgData: EcgData | null
): Promise<TrailsChangeActionState> {
    const session = await auth();
    if (!session) {
        return { success: false, message: 'User authentication failed!' };
    }

    if (!ecgData || !ecgData.id) {
        return { success: false, message: 'Failed to parse summited data.' };
    }

    if (!ecgData.trailsId || ecgData.trailsId.length < 1) {
        return { success: false, message: 'Trails ID cannot be empty.' };
    }

    try {
        //TODO: maybe check that the measurement with given id belongs to the user?
        await prisma.heartMeasurement.update({
            where: { id: ecgData.id },
            data: { trails_id: ecgData.trailsId },
        });
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to save edited trails id.' };
    }

    revalidatePath('/dashboard');
    return { success: true };
}
