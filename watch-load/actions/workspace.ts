'use server';

import { actionClient } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';
import { ActionError, UnauthorizedError } from '@/types/errors';
import {
    createLocationSchema,
    createWorkspaceSchema,
    deleteLocationSchema,
    editLocationSchema,
    manageWorkspaceSchema,
} from '@/lib/validations/workspace';
import { revalidatePath } from 'next/cache';
import { resolveWorkspaceFromId } from '@/lib/workspace';
import * as z from 'zod';
import { GlobalRole, WorkspaceRole } from '@/generated/prisma/enums';
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace';
import { LocationOption } from '@/types/workspace';

// TODO: implement redirect on ui if unauthorized
export const createWorkspace = actionClient
    .metadata({ actionName: 'createWorkspace' })
    .inputSchema(createWorkspaceSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const workspace = await prisma.$transaction(async (tx) => {
                const newWorkspace = await tx.workspace.create({
                    data: {
                        name: parsedInput.name,
                        description: parsedInput.description,
                        slug: parsedInput.slug,
                    },
                });

                await tx.membership.create({
                    data: {
                        userId: ctx.userId,
                        workspaceId: newWorkspace.id,
                        workspaceRole: WorkspaceRole.WORKSPACE_ADMIN,
                    },
                });

                return newWorkspace;
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

export const searchUser = actionClient
    .metadata({ actionName: 'searchUser' })
    .inputSchema(
        z.object({
            workspaceId: z.string(),
            query: z.string(),
        })
    )
    .action(async ({ parsedInput: { workspaceId, query } }) => {
        if (!query) return [];

        const { role } = await resolveWorkspaceFromId(workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }

        return prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { username: { contains: query, mode: 'insensitive' } },
                ],
                memberships: {
                    none: {
                        workspaceId: workspaceId,
                    },
                },
            },
            take: 5,
        });
    });

export const addNewUser = actionClient
    .metadata({ actionName: 'addNewUser' })
    .inputSchema(
        z.object({
            workspaceId: z.string(),
            userId: z.string(),
        })
    )
    .action(async ({ parsedInput: { workspaceId, userId } }) => {
        const {
            workspace: { slug },
            role,
        } = await resolveWorkspaceFromId(workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user) {
            throw new ActionError('User does not exist.');
        }

        try {
            await prisma.membership.create({
                data: {
                    userId,
                    workspaceId,
                    workspaceRole:
                        user.role === GlobalRole.ADMIN
                            ? WorkspaceRole.WORKSPACE_ADMIN
                            : WorkspaceRole.WORKSPACE_USER,
                },
            });
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ActionError(
                    'User is already a member of this workspace.'
                );
            }
            throw new ActionError('Failed to add user to workspace.');
        }

        revalidatePath(`/workspace/${slug}/settings`);
    });

// TODO: allow users to delete them selves
export const removeUser = actionClient
    .metadata({ actionName: 'removeUser' })
    .inputSchema(
        z.object({
            workspaceId: z.string(),
            userId: z.string(),
        })
    )
    .action(async ({ parsedInput: { workspaceId, userId }, ctx }) => {
        const {
            workspace: { slug },
            role,
        } = await resolveWorkspaceFromId(workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }

        if (userId === ctx.userId) {
            throw new ActionError(
                'You cannot remove yourself from the workspace.'
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                role: true,
                memberships: {
                    where: { workspaceId },
                    select: { id: true },
                },
            },
        });

        if (!user) {
            throw new ActionError('User does not exist.');
        }

        if (user.memberships.length === 0) {
            throw new ActionError(
                'Membership not found for user in this workspace.'
            );
        }

        if (user.role === GlobalRole.ADMIN) {
            throw new ActionError(
                'You cannot remove a global administrator from the workspace.'
            );
        }

        await prisma.membership.delete({
            where: { id: user.memberships[0].id },
        });

        revalidatePath(`/workspace/${slug}/settings`);
    });

export const toggleAdmin = actionClient
    .metadata({ actionName: 'toggleAdmin' })
    .inputSchema(
        z.object({
            workspaceId: z.string(),
            userId: z.string(),
            isAdmin: z.boolean(),
        })
    )
    .action(async ({ parsedInput: { workspaceId, userId, isAdmin }, ctx }) => {
        const {
            workspace: { slug },
            role,
        } = await resolveWorkspaceFromId(workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }

        if (userId === ctx.userId) {
            throw new ActionError(
                'You cannot alter your own administrator rights.'
            );
        }

        // Single query to fetch the user and their specific workspace membership
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                role: true,
                memberships: {
                    where: { workspaceId },
                    select: { id: true },
                },
            },
        });

        if (!user) {
            throw new ActionError('User does not exist.');
        }

        if (user.memberships.length === 0) {
            throw new ActionError(
                'Membership not found for user in this workspace.'
            );
        }

        if (user.role === GlobalRole.ADMIN && !isAdmin) {
            throw new ActionError(
                "You cannot revoke a global administrator's rights."
            );
        }

        await prisma.membership.update({
            where: { id: user.memberships[0].id },
            data: {
                workspaceRole: isAdmin
                    ? WorkspaceRole.WORKSPACE_ADMIN
                    : WorkspaceRole.WORKSPACE_USER,
            },
        });

        revalidatePath(`/workspace/${slug}/settings`);
    });

export const manageWorkspace = actionClient
    .metadata({ actionName: 'manageWorkspace' })
    .inputSchema(manageWorkspaceSchema)
    .action(async ({ parsedInput }) => {
        const {
            workspace: { slug, name, description },
            role,
        } = await resolveWorkspaceFromId(parsedInput.workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }

        const hasChanged =
            name !== parsedInput.name ||
            (description ?? '') !== (parsedInput.description ?? '');

        if (!hasChanged) {
            return;
        }

        try {
            await prisma.workspace.update({
                where: { id: parsedInput.workspaceId },
                data: {
                    name: parsedInput.name,
                    description: parsedInput.description,
                },
            });
        } catch (error) {
            console.error(error);

            throw new ActionError('Could not update workspace.');
        }

        revalidatePath(`/workspace/${slug}/settings`);
    });

export const createLocation = actionClient
    .metadata({ actionName: 'createLocation' })
    .inputSchema(createLocationSchema)
    .action(async ({ parsedInput }) => {
        const {
            workspace: { slug },
            role,
        } = await resolveWorkspaceFromId(parsedInput.workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }

        try {
            const query = await prisma.locationOption.create({
                data: {
                    name: parsedInput.name,
                    workspaceId: parsedInput.workspaceId,
                },
            });

            revalidatePath(`/workspace/${slug}/settings`);
            return {
                id: query.id,
                name: query.name,
            };
        } catch (error) {
            console.error(error);
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ActionError(
                    'This location already exists for this workspace.'
                );
            }
            throw new ActionError('Could not create location.');
        }
    });

export const editLocation = actionClient
    .metadata({ actionName: 'editLocation' })
    .inputSchema(editLocationSchema)
    .action(async ({ parsedInput }) => {
        const {
            workspace: { slug },
            role,
        } = await resolveWorkspaceFromId(parsedInput.workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }
        try {
            const query = await prisma.locationOption.update({
                where: { id: parsedInput.id },
                data: {
                    name: parsedInput.name,
                },
            });

            revalidatePath(`/workspace/${slug}/settings`);
            return {
                id: query.id,
                name: query.name,
            };
        } catch (error) {
            console.error(error);
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ActionError(
                    'This location name already exists for this workspace.'
                );
            }
            throw new ActionError('Could not update location.');
        }
    });

export const deleteLocation = actionClient
    .metadata({ actionName: 'deleteLocation' })
    .inputSchema(deleteLocationSchema)
    .action(async ({ parsedInput }) => {
        const {
            workspace: { slug },
            role,
        } = await resolveWorkspaceFromId(parsedInput.workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }
        try {
            await prisma.locationOption.delete({
                where: { id: parsedInput.id },
            });
        } catch (error) {
            console.error(error);
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2003'
            ) {
                throw new ActionError(
                    'This location cannot be deleted as it is currently in use.'
                );
            }
            throw new ActionError('Could not delete location.');
        }

        revalidatePath(`/workspace/${slug}/settings`);
    });
