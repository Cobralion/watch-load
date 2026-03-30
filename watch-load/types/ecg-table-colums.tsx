'use client';

import { ColumnDef } from '@tanstack/react-table';
import { cn, FORMAT_DATE } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type EcgTableData = {
    id: string;
    trailsId?: string;
    heartRate: number;
    afib: string;
    createdAt: Date;
    // signal: number[];
    samplingFrequency: number;
};

export const ECG_DATA_TABLE_COLUMNS: ColumnDef<EcgTableData>[] = [
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

/*     {
        id: '1',
        heartRate: 72,
        afib: 'No',
        createdAt: new Date(),
        signal: [0, 1, 0, 1, 0],
        samplingFrequency: 300,
    },
    {
        id: '2',
        heartRate: 80,
        afib: 'Yes',
        createdAt: new Date(),
        signal: [1, 1, 1, 1, 0],
        samplingFrequency: 300,
    }
 */
