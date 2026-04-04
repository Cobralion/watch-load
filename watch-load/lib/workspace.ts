import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { WorkspaceRole } from '@/generated/prisma/client';
import { cache } from 'react';
import { ResolvedWorkspace, ResolvedWorkspaceRole } from '@/types/workspace';

export const resolveWorkspace = cache(async (workspaceSlug: string) => {
    const result = await resolveWorkspaceRaw(workspaceSlug);
    if ('error' in result) {
        if (result.status === 401) redirect('/login');
        notFound();
    }
    return result.data;
});

export async function resolveWorkspaceRaw(
    workspaceSlug: string
): Promise<{ data: ResolvedWorkspace } | { error: string; status: number }> {
    const session = await auth();
    if (!session || !session?.user?.id) {
        return { error: 'Unauthorized', status: 401 };
    }

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { role: true },
    });

    const workspace = await prisma.workspace.findUnique({
        where: { slug: workspaceSlug },
    });

    if (!workspace) {
        return { error: 'Not Found', status: 404 };
    }

    if (user.role === 'ADMIN') {
        return {
            data: {
                workspace: workspace,
                role: 'ADMIN',
                isGlobalAdmin: true,
                user: session.user,
            },
        };
    }

    const membership = await prisma.membership.findFirst({
        where: {
            userId: session.user.id,
            workspaceId: workspace.id,
        },
    });

    if (!membership) {
        return { error: 'Not Found', status: 404 };
    }

    return {
        data: {
            workspace,
            role: workspaceRoleToRole(membership.workspaceRole),
            isGlobalAdmin: false,
            user: session.user,
        },
    };
}

export async function resolveWorkspaceFromId(
    workspaceId: string
): Promise<{ data: ResolvedWorkspace } | { error: string; status: number }> {
    const session = await auth();
    if (!session || !session?.user?.id) {
        return { error: 'Unauthorized', status: 401 };
    }

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { role: true },
    });

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
    });

    if (!workspace) {
        return { error: 'Not Found', status: 404 };
    }

    if (user.role === 'ADMIN') {
        return {
            data: {
                workspace: workspace,
                role: 'ADMIN',
                isGlobalAdmin: true,
                user: session.user,
            },
        };
    }

    const membership = await prisma.membership.findFirst({
        where: {
            userId: session.user.id,
            workspaceId: workspace.id,
        },
    });

    if (!membership) {
        return { error: 'Not Found', status: 404 };
    }

    return {
        data: {
            workspace,
            role: workspaceRoleToRole(membership.workspaceRole),
            isGlobalAdmin: false,
            user: session.user,
        },
    };
}


function workspaceRoleToRole(
    workspaceRole: WorkspaceRole
): ResolvedWorkspaceRole {
    switch (workspaceRole) {
        case 'WORKSPACE_ADMIN':
            return 'ADMIN';
        case 'WORKSPACE_USER':
            return 'USER';
    }
}
