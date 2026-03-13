'use server';
import ConectedDevicesCard from '@/components/conected-device-card';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getConnectionStatus(): Promise<boolean> {
    const session = await auth();
    if (!session) {
        return false;
    }

    const userId = session.user.id;
    try {
        const devices = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                devices: true,
            },
        });

        if (!devices || devices.devices.length === 0) {
            return false;
        }

        return true;
    } catch (err) {
        console.error('Failed to fetch connection status:', err);
        return false;
    }
}

export default async function ConnectedDevicesPage() {
    const connectionStatus = await getConnectionStatus();
    return <ConectedDevicesCard initialConnectionStatus={connectionStatus} />;
}
