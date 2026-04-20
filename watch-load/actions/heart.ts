'use server';

import { syncHeartData } from '@/lib/withings/heart';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { actionClient } from '@/lib/safe-action';
import { resolveWorkspaceFromId } from '@/lib/workspace';
import * as z from 'zod';
import { ActionError, NoAccessTokenError } from '@/types/errors';
import { BatchPayload } from '@/generated/prisma/internal/prismaNamespace';

export const syncHeartAction = actionClient
    .metadata({ actionName: 'syncHeartAction' })
    .inputSchema(
        z.object({
            workspaceId: z.string(),
        })
    )
    .action(async ({ parsedInput }): Promise<void> => {
        const {
            workspace: { id, slug },
        } = await resolveWorkspaceFromId(parsedInput.workspaceId);

        try {
            await syncHeartData(id);
        } catch (e) {
            console.error(e);
            if (e instanceof NoAccessTokenError) {
                throw new ActionError(
                    'Connection to Withings is invalid. Please reconnect your Withings account in workspace settings.'
                );
            }
            throw e;
        }

        // TODO: check if needed and more robust
        revalidatePath(`/workspace/${slug}`);
    });

export const editTrialsId = actionClient
    .metadata({ actionName: 'editTrialsId' })
    .inputSchema(
        z.object({
            id: z.string(),
            workspaceId: z.string(),
            trialsId: z
                .string()
                .min(1, { message: 'Trials Id cannot be empty.' }),
        })
    )
    .action(async ({ parsedInput }): Promise<void> => {
        const {
            workspace: { slug },
        } = await resolveWorkspaceFromId(parsedInput.workspaceId);

        let batchPayload: BatchPayload | null = null;
        try {
            //TODO: maybe check that the measurement with given id belongs to the user?
            batchPayload = await prisma.heartMeasurement.updateMany({
                where: {
                    id: parsedInput.id,
                    workspaceId: parsedInput.workspaceId,
                },
                data: { trialsId: parsedInput.trialsId },
            });
        } catch (e) {
            console.error(e);
            throw new ActionError('Could not update trials id.');
        }

        if (!batchPayload || batchPayload.count === 0) {
            throw new ActionError('Could not update trials id.');
        }

        revalidatePath(`/workspace/${slug}`);
    });
