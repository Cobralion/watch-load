'use client';
import { EcgDataTable } from '@/components/workspace/ecg-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { FORMAT_DATE } from '@/lib/utils';
import EditTrialsDialog, {
    useTrialsDialogState,
} from '@/components/workspace/trials-edit-dialog';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { LocationOption } from '@/types/workspace';
import LocationSelect from '@/components/workspace/location-select';
import { useWorkspace } from '@/app/(dashboard)/workspace/[workspaceSlug]/workspace-provider';
import { useMemo } from 'react';

export type EcgData = {
    id: string;
    trialsId: string | null;
    location: LocationOption | null;
    heartRate: number;
    afib: string;
    timestamp: Date;
    samplingFrequency: number;
};

export default function EcgDataColumns({
    ecgData,
    possibleWorkspaceLocations,
}: {
    ecgData: EcgData[];
    possibleWorkspaceLocations: LocationOption[];
}) {
    const { isOpen, toggleModal, data, setData } = useTrialsDialogState();
    const { workspace } = useWorkspace();

    const columns = useMemo<ColumnDef<EcgData>[]>(
        () => [
            {
                accessorKey: 'id',
                header: ({ column }) => {
                    const isSorted = column.getIsSorted();
                    const SortIcon =
                        isSorted === 'asc'
                            ? ArrowUp
                            : isSorted === 'desc'
                              ? ArrowDown
                              : ArrowUpDown;

                    return (
                        <Button
                            variant="ghost"
                            onClick={() =>
                                column.toggleSorting(isSorted === 'asc')
                            }
                        >
                            ID
                            <SortIcon className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
            },
            {
                accessorKey: 'trialsId',
                header: ({ column }) => {
                    const isSorted = column.getIsSorted();
                    const SortIcon =
                        isSorted === 'asc'
                            ? ArrowUp
                            : isSorted === 'desc'
                              ? ArrowDown
                              : ArrowUpDown;

                    return (
                        <Button
                            variant="ghost"
                            onClick={() =>
                                column.toggleSorting(isSorted === 'asc')
                            }
                        >
                            Trials ID
                            <SortIcon className="ml-2 h-4 w-4" />
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
                accessorKey: 'location',
                header: ({ column }) => {
                    const isSorted = column.getIsSorted();
                    const SortIcon =
                        isSorted === 'asc'
                            ? ArrowUp
                            : isSorted === 'desc'
                              ? ArrowDown
                              : ArrowUpDown;

                    return (
                        <Button
                            variant="ghost"
                            onClick={() =>
                                column.toggleSorting(isSorted === 'asc')
                            }
                        >
                            Location
                            <SortIcon className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => {
                    const original = row.original;
                    return (
                        <LocationSelect
                            id={original.id}
                            workspaceId={workspace.id}
                            locationId={original.location?.id}
                            possibleWorkspaceLocations={
                                possibleWorkspaceLocations
                            }
                        />
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
                                column.toggleSorting(
                                    column.getIsSorted() === 'asc'
                                )
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
        ],
        [toggleModal, setData, workspace.id, possibleWorkspaceLocations]
    );
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
