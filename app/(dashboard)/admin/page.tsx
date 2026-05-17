import AdminCreateUserCard from '@/components/admin/admin-create-user-card';
import ManageGlobalUserCard from '@/components/admin/manage-global-user-card';
import ManageGlobalUserDataTable from '@/components/admin/manage-global-user-data-table';
import { columns } from '@/components/admin/manage-global-user-columns';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { GlobalUser } from '@/types/admin';

export default async function Page() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const users = await prisma.user.findMany({
        select: { id: true, username: true, name: true, role: true },
        orderBy: { username: 'asc' },
    });

    const globalUsers: GlobalUser[] = users.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        isGlobalAdmin: u.role === 'ADMIN',
    }));

    return (
        <div className="flex items-start gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <div className="m-4 flex w-1/2 flex-col gap-6 pt-6">
                <AdminCreateUserCard />
                <ManageGlobalUserCard>
                    <ManageGlobalUserDataTable
                        columns={columns}
                        data={globalUsers}
                    />
                </ManageGlobalUserCard>
            </div>
        </div>
    );
}
