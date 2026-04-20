import { resolveWorkspaceFromSlug } from '@/lib/workspace';
import EcgDataColumns, {
    EcgData,
} from '@/components/workspace/ecg-data-columns';
import { prisma } from '@/lib/prisma';
import { EcgCard } from '@/components/workspace/ecg-card';

async function getData(workspaceId: string): Promise<EcgData[]> {
    // TODO: handle large amount of measurements
    const queryResults = await prisma.heartMeasurement.findMany({
        where: {
            workspaceId,
        },
        orderBy: { timestamp: 'desc' },
    });

    // TODO: handle null | undefined
    return queryResults.map(
        (result): EcgData => ({
            id: result.id,
            trailsId: result.trailsId,
            afib: result.afib ?? 'UNKNOWN',
            timestamp: result.timestamp,
            heartRate: result.heartRate,
            samplingFrequency: result.samplingFrequency,
        })
    );
}

export default async function WorkspaceDashboard({
    params,
}: {
    params: Promise<{ workspaceSlug: string }>;
}) {
    const { workspaceSlug } = await params;
    // TODO: remove and only rely on the call in layout and client components
    const { workspace } = await resolveWorkspaceFromSlug(workspaceSlug);

    const data = await getData(workspace.id);

    return (
        <>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="m-4 flex flex-col gap-6 pt-6">
                <EcgCard>
                    <EcgDataColumns ecgData={data}></EcgDataColumns>
                </EcgCard>
            </div>
        </>
    );
}
