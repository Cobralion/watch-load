import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import {
    WorkspaceRole,
} from '@/generated/prisma/client';
import { cache } from 'react';
import { ResolvedWorkspace, ResolvedWorkspaceRole } from '@/types/workspace';


export const resolveWorkspace = cache(_resolveWorkspace);

async function _resolveWorkspace(
    workspaceSlug: string
): Promise<ResolvedWorkspace> {
    const session = await auth();
    if (!session || !session?.user?.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUniqueOrThrow({
       where: { id: session.user.id },
       select: {role: true},
    });

    const workspace = await prisma.workspace.findUnique({
        where: { slug: workspaceSlug },
    });

    if(!workspace) {
        notFound();
    }

    if(user.role === 'ADMIN') {
    return {
        workspace: workspace,
        role: 'ADMIN',
        isGlobalAdmin: true,
        user: session.user,
    };
    }

    const membership = await prisma.membership.findFirst({
        where: {
            userId: session.user.id,
            workspaceId: workspace.id,
        }
    });

    if (!membership) {
        notFound();
    }

    return {
        workspace,
        role: workspaceRoleToRole(membership.workspaceRole),
        isGlobalAdmin: false,
        user: session.user,
    };
}

function workspaceRoleToRole(workspaceRole: WorkspaceRole): ResolvedWorkspaceRole {
    switch (workspaceRole) {
        case 'WORKSPACE_ADMIN':
            return 'ADMIN';
        case 'WORKSPACE_USER':
            return 'USER';
    }
}