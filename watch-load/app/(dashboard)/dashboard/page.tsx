import NewWorkspaceCard from '@/components/dashboard/new-workspace-card';

export default async function Page() {
    return (
        <>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="m-4 flex w-1/2 flex-col gap-6 pt-6 mx-auto">
                <NewWorkspaceCard></NewWorkspaceCard>
            </div>
        </>
    );
}
