'use client';

import { ColumnDef } from '@tanstack/react-table';

export type EcgTableData = {
    id: string;
    trailsId?: string;
    date: Date;
    data: string; // change to object
};

export const columns: ColumnDef<EcgTableData>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'trailsId',
        header: 'Trails ID',
    },
    {
        accessorKey: 'date',
        header: 'Date',
    },
    {
        accessorKey: 'data',
        header: 'Data',
    },
];
