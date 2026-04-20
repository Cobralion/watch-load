'use server';

import { actionClient } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';
import { GlobalRole, WorkspaceRole } from '@/generated/prisma/enums';

export const listSidebarItems = actionClient
    .metadata({ actionName: 'listSidebarItems' })
    .action(async ({ ctx: { userId } }) => {
        const user = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { role: true },
        });

        if (user.role === GlobalRole.ADMIN) {
            const workspaces = await prisma.workspace.findMany({
                orderBy: { name: 'asc' },
            });
            return workspaces.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                slug: item.slug,
                showProtected: user.role === GlobalRole.ADMIN,
            }));
        }

        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: { workspace: true },
            orderBy: { workspace: { name: 'asc' } },
        });

        return memberships.map((item) => ({
            id: item.workspace.id,
            name: item.workspace.name,
            description: item.workspace.description,
            slug: item.workspace.slug,
            showProtected: item.workspaceRole === WorkspaceRole.WORKSPACE_ADMIN
        }));
    });
