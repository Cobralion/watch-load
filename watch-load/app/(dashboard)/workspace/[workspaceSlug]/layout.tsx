import { ReactNode } from 'react';
import { resolveWorkspace } from '@/lib/workspace';
import { WorkspaceProvider } from '@/app/(dashboard)/workspace/[workspaceSlug]/workspace-provider';

export default async function WorkspaceLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ workspaceSlug: string }>;
}) {
    const { workspaceSlug } = await params;
    const { workspace, role, isGlobalAdmin } = await resolveWorkspace(workspaceSlug);


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
