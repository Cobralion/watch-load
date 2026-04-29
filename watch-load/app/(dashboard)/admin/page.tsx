import AdminCreateUserCard from '@/components/admin/admin-create-user-card';

export default async function Page() {
    return (
        <div className="flex items-start gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <div className="m-4 flex w-1/2 flex-col gap-6 pt-6">
                <AdminCreateUserCard />
            </div>
        </div>
    );
}
