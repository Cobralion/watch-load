import ConnectedDevicesCard from '@/components/conected-device-card';
import { prisma } from '@/lib/prisma';
import { resolveWorkspaceFromSlug } from '@/lib/workspace';
import { redirect } from 'next/navigation';

async function getConnectionStatus(workspaceId: string): Promise<boolean> {
    try {
        const connections = await prisma.withingsConnection.findMany({
            where: { workspaceId: workspaceId },
        });

        return !(!connections || connections.length === 0);
    } catch (err) {
        console.error('Failed to fetch connection status:', err);
        return false;
    }
}

export default async function ConnectedDevicesPage({
    params,
}: {
    params: Promise<{ workspaceSlug: string }>;
}) {
    const { workspaceSlug } = await params;
    const { workspace, role } = await resolveWorkspaceFromSlug(workspaceSlug);

    if (role !== 'ADMIN') {
        redirect(`/workspace/${workspaceSlug}`);
    }

    const connectionStatus = await getConnectionStatus(workspace.id);
    return <ConnectedDevicesCard initialConnectionStatus={connectionStatus} />;
}
