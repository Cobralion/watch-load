'use server';

import { actionClient } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';
import { ActionError, UnauthorizedError } from '@/types/errors';
import {
    createWorkspaceSchema,
    manageWorkspaceSchema,
} from '@/lib/validations/dashboard';
import { revalidatePath } from 'next/cache';
import { resolveWorkspaceFromId } from '@/lib/workspace';
import * as z from 'zod';
import { GlobalRole, WorkspaceRole } from '@/generated/prisma/enums';
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace';

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
        const { workspace: { slug }, role } = await resolveWorkspaceFromId(workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user) {
            throw new ActionError('User does not exist.');
        }

        try {
            await prisma.membership.create({
                data: {
                    userId,
                    workspaceId,
                    workspaceRole: user.role === GlobalRole.ADMIN
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
        const { workspace: { slug }, role } = await resolveWorkspaceFromId(workspaceId);

        if (role !== 'ADMIN') {
            throw new UnauthorizedError();
        }

        if (userId === ctx.userId) {
            throw new ActionError('You cannot alter your own administrator rights.');
        }

        // Single query to fetch the user and their specific workspace membership
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                role: true,
                memberships: {
                    where: { workspaceId },
                    select: { id: true }
                }
            },
        });

        if (!user) {
            throw new ActionError('User does not exist.');
        }

        if (user.memberships.length === 0) {
            throw new ActionError('Membership not found for user in this workspace.');
        }

        if (user.role === GlobalRole.ADMIN) {
            throw new ActionError('You cannot revoke a global administrator\'s rights.');
        }

        await prisma.membership.update({
            where: { id: user.memberships[0].id },
            data: {
                workspaceRole: isAdmin ? WorkspaceRole.WORKSPACE_ADMIN : WorkspaceRole.WORKSPACE_USER,
            },
        });

        revalidatePath(`/workspace/${slug}/settings`);
    });

// export const manageWorkspace = actionClient
//     .metadata({ actionName: 'manageWorkspace' })
//     .inputSchema(manageWorkspaceSchema)
//     .bindArgsSchemas<[workspaceId: z.ZodString]>([z.string()])
//     .action(
//         async ({ parsedInput, ctx, bindArgsParsedInputs: [workspaceId] }) => {
//             const {
//                 workspace: { slug },
//                 isGlobalAdmin,
//                 role,
//             } = await resolveWorkspaceFromId(workspaceId);
//
//             if (!isGlobalAdmin && role !== 'ADMIN') {
//                 redirect(`/workspace/${slug}`);
//             }
//
//             // Global admins can remove themselves, since they can edit any workspace, even though the ui doesn't currently support this.
//             if (!parsedInput.adminIds.includes(ctx.userId)) {
//                 throw new ActionError(
//                     "You can't remove yourself from this workspace."
//                 );
//             }
//
//             const overlap = parsedInput.adminIds.filter((id) =>
//                 parsedInput.memberIds.includes(id)
//             );
//             if (overlap.length > 0) {
//                 throw new ActionError(
//                     'A user cannot be both an admin and a member.'
//                 );
//             }
//
//             const incoming = [
//                 ...parsedInput.adminIds.map((id) => ({
//                     userId: id,
//                     workspaceRole: WorkspaceRole.WORKSPACE_ADMIN,
//                 })),
//                 ...parsedInput.memberIds.map((id) => ({
//                     userId: id,
//                     workspaceRole: WorkspaceRole.WORKSPACE_USER,
//                 })),
//             ];
//
//             const incomingIds = incoming.map((i) => i.userId);
//
//             const existing = await prisma.membership.findMany({
//                 where: { workspaceId },
//                 select: { userId: true, workspaceRole: true },
//             });
//
//             const toCreate = incoming.filter(
//                 (user) => !existing.some((e) => e.userId === user.userId)
//             );
//             const toDelete = existing.filter(
//                 (user) => !incomingIds.includes(user.userId)
//             );
//             const toUpdate = incoming.filter((m) => {
//                 const match = existing.find((e) => e.userId === m.userId);
//                 return match && match.workspaceRole !== m.workspaceRole;
//             });
//
//             await prisma.$transaction([
//                 prisma.workspace.update({
//                     where: { id: workspaceId },
//                     data: {
//                         name: parsedInput.name,
//                         description: parsedInput.description,
//                     },
//                 }),
//                 prisma.membership.createMany({
//                     data: toCreate.map((m) => ({ ...m, workspaceId })),
//                     skipDuplicates: true,
//                 }),
//                 prisma.membership.deleteMany({
//                     where: {
//                         workspaceId,
//                         userId: { in: toDelete.map((e) => e.userId) },
//                     },
//                 }),
//                 ...toUpdate.map((m) =>
//                     prisma.membership.update({
//                         where: {
//                             userId_workspaceId: {
//                                 userId: m.userId,
//                                 workspaceId,
//                             },
//                         },
//                         data: { workspaceRole: m.workspaceRole },
//                     })
//                 ),
//             ]);
//
//             revalidatePath(`/workspace/${slug}/settings`);
//         }
//     );
