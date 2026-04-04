import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Workspace, WorkspaceRole } from '@/generated/prisma/client';
import { cache } from 'react';
import {
    ResolvedWorkspace,
    ResolvedWorkspaceRole,
    WorkspaceContext,
} from '@/types/resolvedWorkspace';
import { WorkspaceError } from '@/types/errors';
import { NextResponse } from 'next/server';

type WorkspaceIdOrSlug = { workspaceId: string } | { workspaceSlug: string };

const resolve = cache(
    async (idOrSlug: WorkspaceIdOrSlug): Promise<ResolvedWorkspace> => {
        const session = await auth();

        if (!session?.user?.id) {
            redirect('/login');
        }

        try {
            const result = await resolveWorkspaceRaw(
                session.user.id,
                idOrSlug,
                session.user.role
            );
            return {
                ...result,
                user: session.user,
            };
        } catch (err) {
            if (err instanceof WorkspaceError && err.status === 404) {
                notFound();
            }
            throw err;
        }
    }
);

const resolveRawNoAuth = async (
    userId: string,
    userRole: string,
    idOrSlug: WorkspaceIdOrSlug
): Promise<WorkspaceContext | NextResponse> => {
    try {
        const result = await resolveWorkspaceRaw(
            userId,
            idOrSlug,
            userRole
        );
        return {
            ...result,
        };
    } catch (err) {
        if (err instanceof WorkspaceError && err.status === 404) {
            return new NextResponse('Not found', { status: 404 });
        }
        console.error('Error resolving workspace', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
};

export const resolveWorkspaceFromSlug = (slug: string) =>
    resolve({ workspaceSlug: slug });
export const resolveWorkspaceFromId = (id: string) =>
    resolve({ workspaceId: id });

export const resolveWorkspaceRawNoAuthFromSlug = (
    userId: string,
    userRole: string,
    slug: string
) => resolveRawNoAuth(userId, userRole, { workspaceSlug: slug });
export const resolveWorkspaceRawNoAuthFromId = (
    userId: string,
    userRole: string,
    id: string
) => resolveRawNoAuth(userId, userRole, { workspaceId: id });

async function resolveWorkspaceRaw(
    userId: string,
    idOrSlug: WorkspaceIdOrSlug,
    globalRole?: string
): Promise<WorkspaceContext> {
    const workspace = await getWorkspace(idOrSlug);

    if (globalRole === 'ADMIN') {
        return {
            workspace,
            role: 'ADMIN',
            isGlobalAdmin: true,
        };
    }

    const membership = await prisma.membership.findFirst({
        where: {
            userId: userId,
            workspaceId: workspace.id,
        },
    });

    if (!membership) {
        throw new WorkspaceError('Not found', 404);
    }

    return {
        workspace,
        role: workspaceRoleToRole(membership.workspaceRole),
        isGlobalAdmin: false,
    };
}

async function getWorkspace(idOrSlug: WorkspaceIdOrSlug): Promise<Workspace> {
    const workspace = await prisma.workspace.findUnique({
        where:
            'workspaceId' in idOrSlug
                ? { id: idOrSlug.workspaceId }
                : { slug: idOrSlug.workspaceSlug },
    });

    if (!workspace) {
        throw new WorkspaceError('Not found', 404);
    }
    return workspace;
}

function workspaceRoleToRole(role: WorkspaceRole): ResolvedWorkspaceRole {
    const mapping: Record<WorkspaceRole, ResolvedWorkspaceRole> = {
        WORKSPACE_ADMIN: 'ADMIN',
        WORKSPACE_USER: 'USER',
    };
    return mapping[role] ?? 'USER';
}
