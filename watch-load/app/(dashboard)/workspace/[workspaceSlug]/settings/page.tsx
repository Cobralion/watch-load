import { resolveWorkspaceFromSlug } from '@/lib/workspace';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ManageWorkspaceCard, {
    WorkspaceUserWithRole,
} from '@/components/dashboard/manage-workspace-card';

export default async function WorkspaceSettingsPage({
    params,
}: {
    params: Promise<{ workspaceSlug: string }>;
}) {
    const { workspaceSlug } = await params;
    const { workspace, role, user } =
        await resolveWorkspaceFromSlug(workspaceSlug);

    if (role !== 'ADMIN') {
        redirect('/workspace/' + workspaceSlug);
    }

    const membershipsQuery = await prisma.membership.findMany({
        where: { workspaceId: workspace.id },
        include: { user: true },
    });
    const allUsersQuery = await prisma.user.findMany({});

    const users = membershipsQuery.map(
        (x): WorkspaceUserWithRole => ({
            id: x.userId,
            name: x.user.name,
            username: x.user.username,
            workspaceRole: x.workspaceRole,
        })
    );
    const allUsers = allUsersQuery.map(
        (x): WorkspaceUserWithRole => ({
            id: x.id,
            name: x.name,
            username: x.username,
            workspaceRole: null,
        })
    );

    console.log('Users: ', users);
    console.log('allUsers: ', allUsers);

    return (
        <>
            <h1 className="text-2xl font-bold tracking-tight">
                Workspace settings
            </h1>
            <div className="m-4 flex w-1/2 flex-col gap-6 pt-6">
                <ManageWorkspaceCard
                    workspace={workspace}
                    users={users}
                    allUsers={allUsers}
                    currentUserId={user?.id}
                ></ManageWorkspaceCard>
            </div>
        </>
    );
}
