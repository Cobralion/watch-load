'use server';

import { prisma } from '@/lib/prisma';
import { disconnectDevice } from '@/lib/withings/oauth';
import { resolveWorkspaceFromId } from '@/lib/workspace';
import { publicActionClient } from '@/lib/safe-action';
import * as z from 'zod';
import { ActionError } from '@/types/errors';

// TODO: use cleaner safe-action architeture
export const disconnectDevices = publicActionClient
    .inputSchema(
        z.object({
            workspaceId: z.string(),
        })
    )
    .action(async ({ parsedInput }) => {
        const { workspaceId } = parsedInput;
        const payload = await resolveWorkspaceFromId(workspaceId);
        if ('error' in payload) {
            throw new ActionError(payload.error);
        }
        if(payload.data.role !== 'ADMIN') {
            throw new ActionError('You are not allowed to perform this action.');
        }

        const connection = await prisma.withingsConnection.findFirst({
            where: { workspaceId: workspaceId },
        });

        if (!connection) {
            throw new ActionError('No connection found.');
        }

        const result = await disconnectDevice(connection, workspaceId);

        if (!result) {
            throw new ActionError('Disconnection failed.');
        }
    });
