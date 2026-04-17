'use server';
import { actionClient } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/errors';
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace';
import {
    createWorkspaceSchema,
    manageWorkspaceSchema,
} from '@/lib/validations/dashboard';
import { revalidatePath } from 'next/cache';

export const createWorkspace = actionClient
    .metadata({ actionName: 'createWorkspace' })
    .inputSchema(createWorkspaceSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const workspace = await prisma.$transaction(async (tx) => {
                const workspace = await tx.workspace.create({
                    data: {
                        name: parsedInput.name,
                        description: parsedInput.description,
                        slug: parsedInput.slug,
                    },
                });
                tx.membership.create({
                    data: {
                        userId: ctx.userId,
                        workspaceId: workspace.id,
                        workspaceRole: 'WORKSPACE_ADMIN',
                    },
                });

                return workspace;
            });

            revalidatePath('/dashboard');
            return { workspace };
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ActionError(
                    'A workspace with this slug already exists.'
                );
            }
            throw new ActionError('Could not create workspace.');
        }
    });

export const manageWorkspace = actionClient
    .metadata({ actionName: 'manageWorkspace' })
    .inputSchema(manageWorkspaceSchema)
    .action(async ({ parsedInput }) => {});
