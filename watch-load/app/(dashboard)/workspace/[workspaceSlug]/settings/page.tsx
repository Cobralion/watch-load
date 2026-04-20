import { resolveWorkspaceFromSlug } from '@/lib/workspace';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ManageWorkspaceUserCard from '@/components/workspace-settings/manage-workspace-user-card';
import ManageWorkspaceUserDataTable from '@/components/workspace-settings/manage-workspace-user-data-table';
import { columns } from '@/components/workspace-settings/manage-workspace-user-columns';
import { WorkspaceMember } from '@/types/workspace';
import ManageWorkspaceCard from '@/components/workspace-settings/manage-workspace-card';

export default async function WorkspaceSettingsPage({
    params,
}: {
    params: Promise<{ workspaceSlug: string }>;
}) {
    const { workspaceSlug } = await params;
    const { workspace, role } = await resolveWorkspaceFromSlug(workspaceSlug);

    if (role !== 'ADMIN') {
        redirect(`/workspace/${workspaceSlug}`);
    }

    const membershipsQuery = await prisma.membership.findMany({
        where: { workspaceId: workspace.id },
        include: { user: true },
    });

    const data = membershipsQuery.map(
        (membership): WorkspaceMember => ({
            id: membership.userId,
            name: membership.user.name ?? membership.user.username,
            username: membership.user.username,
            isWorkspaceAdmin: membership.workspaceRole === 'WORKSPACE_ADMIN',
        })
    );

    return (
        <div className="flex items-start gap-6">
            <h1 className="text-2xl font-bold tracking-tight">
                Workspace settings
            </h1>
            <div className="m-4 flex w-1/2 flex-col gap-6 pt-6">
                <ManageWorkspaceCard
                    workspace={workspace}
                ></ManageWorkspaceCard>

                <ManageWorkspaceUserCard>
                    <ManageWorkspaceUserDataTable
                        columns={columns}
                        data={data}
                        workspaceId={workspace.id}
                    ></ManageWorkspaceUserDataTable>
                </ManageWorkspaceUserCard>
            </div>
        </div>
    );
}
