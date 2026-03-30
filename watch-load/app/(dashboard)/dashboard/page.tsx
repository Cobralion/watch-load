import { ECGDataTable } from '@/components/dashboard/ecg-data-table';
import { ECG_DATA_TABLE_COLUMNS, EcgTableData } from '@/types/ecg-table-colums';
import { EcgCard } from '@/components/dashboard/ecg-card';

async function getData(): Promise<EcgTableData[]> {
    // Fetch data from your API here.
    return [
        {
            id: '1',
            heartRate: 72,
            afib: 'No',
            createdAt: new Date(),
            samplingFrequency: 300,
        },
        {
            id: '2',
            heartRate: 80,
            afib: 'Yes',
            createdAt: new Date(),
            samplingFrequency: 300,
        },
    ];
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
