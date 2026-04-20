'use client';
import { EcgDataTable } from '@/components/workspace/ecg-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { FORMAT_DATE } from '@/lib/utils';
import EditTrialsDialog, {
    useTrialsDialogState,
} from '@/components/workspace/trials-edit-dialog';
import { ArrowUpDown } from 'lucide-react';

export type EcgData = {
    id: string;
    trialsId: string | null;
    heartRate: number;
    afib: string;
    timestamp: Date;
    samplingFrequency: number;
};

export default function EcgDataColumns({ ecgData }: { ecgData: EcgData[] }) {
    const { isOpen, toggleModal, data, setData } = useTrialsDialogState();

    const columns: ColumnDef<EcgData>[] = [
        {
            accessorKey: 'id',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'trialsId',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Trials ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const original = row.original;
                const trialsId = row.original.trialsId;
                const isSet =
                    trialsId !== null &&
                    trialsId !== undefined &&
                    trialsId.length > 0;

                return (
                    <>
                        <div className="flex justify-between gap-3">
                            {isSet ? (
                                <span className="text-primary font-medium">
                                    {original?.trialsId}
                                </span>
                            ) : (
                                <span className="text-muted-foreground text-sm italic">
                                    Unassigned
                                </span>
                            )}
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 cursor-pointer px-3 text-xs"
                                onClick={() => {
                                    setData(original);
                                    toggleModal();
                                }}
                            >
                                Edit
                            </Button>
                        </div>
                    </>
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
            accessorKey: 'timestamp',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Measured at
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue('timestamp'));

                const formatted = FORMAT_DATE.format(date);

                return <span>{formatted}</span>;
            },
        },
        {
            accessorKey: 'samplingFrequency',
            header: 'Sampling frequency',
        },
    ];
    return (
        <>
            <EcgDataTable columns={columns} data={ecgData} />
            <EditTrialsDialog
                key={data?.id}
                isOpen={isOpen}
                toggleModal={toggleModal}
                data={data}
            />
        </>
    );
}
