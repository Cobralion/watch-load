'use server';

import { actionClient } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';

export const listSidebarItems = actionClient
    .metadata({ actionName: 'listSidebarItems', requiredRole: 'USER' })
    .action(async ({ ctx: {userId} }) => {
        const user = await prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { role: true },
        });

        if (user.role === 'ADMIN') {
            const workspaces = await prisma.workspace.findMany({
                orderBy: { name: 'asc' },
            });
            return workspaces.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                slug: item.slug
            }));
        }

        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: { workspace: true },
            orderBy: { workspace: { name: 'asc' } },
        });

        const workspaces = memberships.map((m) => m.workspace);
        return workspaces.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            slug: item.slug,
        }));;
    });
