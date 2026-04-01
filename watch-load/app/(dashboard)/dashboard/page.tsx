import EcgDataTable, { EcgData } from '@/components/dashboard/ecg-data-table';
import { EcgCard } from '@/components/dashboard/ecg-card';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getData(): Promise<EcgData[]> {
    const session = await auth();
    if (!session) {
        // TODO: Handle unauthenticated user case
        return [];
    }

    // TODO: handle large amount of measurements
    const querryResults = await prisma.heartMeasurement.findMany();

    // TODO: handle null | undefined
    return querryResults.map((result): EcgData => ({
        id: result.id,
        trailsId: result.trailsId,
        afib: result.afib ?? 'UNKNOWN',
        timestamp: result.timestamp,
        heartRate: result.heartRate,
        samplingFrequency: result.samplingFrequency,
    }));
}

export default async function Page() {
    const data = await getData();

    return (
        <>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="m-4 flex flex-col gap-6 pt-6">
                <EcgCard>
                    <EcgDataTable ecgData={data}></EcgDataTable>
                </EcgCard>
            </div>
        </>
    );
}
