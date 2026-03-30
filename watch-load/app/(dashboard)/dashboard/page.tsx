import { ECGDataTable } from '@/components/dashboard/ecg-data-table';
import { ECG_DATA_TABLE_COLUMNS, EcgTableData } from '@/types/ecg-table-colums';
import { EcgCard } from '@/components/dashboard/ecg-card';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getData(): Promise<EcgTableData[]> {
    const session = await auth();
    if(!session) {
    // TODO: Handle unauthenticated user case
        return [];
    }

    // TODO: handle large amount of measurements
    const querryResults = await prisma.heartMeasurement.findMany();

    // TODO: handle null | undefined
    return querryResults.map((result): EcgTableData[] => ({
        id: result.id,
        trailsId: result.trails_id,
        afib: result.afib ?? 'UNKNOWN',
        createdAt: result.timestamp,
        heartRate: result.heart_rate,
        samplingFrequency: result.sampling_frequency,
    }));
}

export default async function Page() {
    const data = await getData();

    return (
        <>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="m-4 flex flex-col gap-6 pt-6">
                <EcgCard>
                    <ECGDataTable
                        columns={ECG_DATA_TABLE_COLUMNS}
                        data={data}
                    ></ECGDataTable>
                </EcgCard>
            </div>
        </>
    );
}
