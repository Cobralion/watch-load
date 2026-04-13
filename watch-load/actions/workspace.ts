'use server';
import { actionClient } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/errors';
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace';
import { createWorkspaceSchema } from '@/lib/validations/dashboard';
import { revalidatePath } from 'next/cache';

export const createWorkspace = actionClient
    .metadata({ actionName: 'createWorkspace' })
    .inputSchema(createWorkspaceSchema)
    .action(async ({ parsedInput }) => {
        try {
            const workspace = await prisma.workspace.create({
                data: {
                    name: parsedInput.name,
                    description: parsedInput.description,
                    slug: parsedInput.slug,
                },
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
