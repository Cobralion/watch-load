import { ReactNode } from 'react';
import { WorkspaceProvider } from '@/app/(dashboard)/workspace/[workspaceSlug]/workspace-provider';
import { resolveWorkspaceFromSlug } from '@/lib/workspace';

export default async function WorkspaceLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ workspaceSlug: string }>;
}) {
    const { workspaceSlug } = await params;
    const { workspace, role, isGlobalAdmin } =
        await resolveWorkspaceFromSlug(workspaceSlug);

    return (
        <WorkspaceProvider
            workspace={workspace}
            role={role}
            isGlobalAdmin={isGlobalAdmin}
        >
            <main>{children}</main>
        </WorkspaceProvider>
    );
}
