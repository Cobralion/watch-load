'use client';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { FORMAT_DATE } from '@/lib/utils';


export type EcgData = {
    id: string;
    trailsId?: string;
    heartRate: number;
    afib: string;
    createdAt: Date;
    samplingFrequency: number;
};

export const columns: ColumnDef<EcgData>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'trailsId',
        header: 'Trails ID',
        cell: ({ row, table }) => {
            const trailsId = row.original.trailsId;
            const isSet = trailsId && trailsId.trim() === '';

            return (
                <div className="flex items-center gap-3">
                    {isSet ? (
                        <span className="text-primary font-medium">
                            {trailsId}
                        </span>
                    ) : (
                        <span className="text-muted-foreground text-sm italic">
                            Unassigned
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 px-3 text-xs"
                    >
                        Edit
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: 'heartRate',
        header: 'HF',
    },
    {
        accessorKey: 'afib',
        header: 'Atrial fibrillation',
    },
    {
        accessorKey: 'createdAt',
        header: 'Creation date',
        cell: ({ row }) => {
            const date = new Date(row.getValue('createdAt'));

            const formatted = FORMAT_DATE.format(date);

            return <span>{formatted}</span>;
        },
    },
    {
        accessorKey: 'samplingFrequency',
        header: 'Sampling frequency',
    },
];

export default function EcgDataTable({ ecgData }: { ecgData: EcgData[] }) {
    const columns: ColumnDef<EcgData>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'trailsId',
            header: 'Trails ID',
            cell: ({ row, table }) => {
                const trailsId = row.original.trailsId;
                const isSet = trailsId && trailsId.trim() === '';

                return (
                    <div className="flex items-center gap-3">
                        {isSet ? (
                            <span className="text-primary font-medium">
                                {trailsId}
                            </span>
                        ) : (
                            <span className="text-muted-foreground text-sm italic">
                                Unassigned
                            </span>
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-3 text-xs"
                        >
                            Edit
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: 'heartRate',
            header: 'HF',
        },
        {
            accessorKey: 'afib',
            header: 'Atrial fibrillation',
        },
        {
            accessorKey: 'createdAt',
            header: 'Creation date',
            cell: ({ row }) => {
                const date = new Date(row.getValue('createdAt'));

                const formatted = FORMAT_DATE.format(date);

                return <span>{formatted}</span>;
            },
        },
        {
            accessorKey: 'samplingFrequency',
            header: 'Sampling frequency',
        },
    ];
    return <DataTable columns={columns} data={ecgData} />;
}
