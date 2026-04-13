import NewWorkspaceCard from '@/components/dashboard/new-workspace-card';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';


export default async function Page() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const users = await prisma.user.findMany({
        where: { id: { not: session.user.id } },
        select: { id: true, name: true, username: true },
        orderBy: { name: 'asc' },
    });
    return (
        <>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="m-4 flex w-1/2 flex-col gap-6 pt-6">
                <NewWorkspaceCard users={users}></NewWorkspaceCard>
            </div>
        </>
    );
}
