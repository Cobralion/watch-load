import { Workspace } from '@/generated/prisma/client';
import { User } from 'next-auth';

type WorkspaceContext = {
    workspace: Workspace;
    role: ResolvedWorkspaceRole;
    isGlobalAdmin: boolean;
};

type ResolvedWorkspace = WorkspaceContext & { user: User };

type ResolvedWorkspaceRole = 'ADMIN' | 'USER';

export type { WorkspaceContext, ResolvedWorkspace, ResolvedWorkspaceRole };
