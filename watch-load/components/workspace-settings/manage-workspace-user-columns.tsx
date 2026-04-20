'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Row } from '@tanstack/react-table';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { WorkspaceMember } from '@/types/workspace';
import { useAction } from 'next-safe-action/hooks';
import { removeUser, toggleAdmin } from '@/actions/workspace';
import { useWorkspace } from '@/app/(dashboard)/workspace/[workspaceSlug]/workspace-provider';
import { toast } from 'sonner';

export const columns: ColumnDef<WorkspaceMember>[] = [
    {
        accessorKey: 'username',
        header: 'Username',
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'isWorkspaceAdmin',
        header: 'Admin',
        cell: ({ row }) => <RoleSwitchCell row={row} />,
    },
    {
        id: 'actions',
        cell: ({ row }) => <RemoveDropdownCell row={row} />,
    },
];

interface RoleSwitchCellProps {
    row: Row<WorkspaceMember>;
}

export const RoleSwitchCell = ({ row }: RoleSwitchCellProps) => {
    const member = row.original;
    const { execute, isPending } = useAction(toggleAdmin, {
        onError: ({ error }) => {
            toast.error(error.serverError, { position: 'top-right' });
        },
    });
    const { workspace } = useWorkspace();

    return (
        <Switch
            checked={member.isWorkspaceAdmin}
            onCheckedChange={() =>
                execute({
                    workspaceId: workspace.id,
                    userId: member.id,
                    isAdmin: !member.isWorkspaceAdmin,
                })
            }
            disabled={isPending}
        />
    );
};

interface RemoveDropdownCellProps {
    row: Row<WorkspaceMember>;
}

export const RemoveDropdownCell = ({ row }: RemoveDropdownCellProps) => {
    const member = row.original;
    const { execute, isPending } = useAction(removeUser, {
        onError: ({ error }) => {
            toast.error(error.serverError, { position: 'top-right' });
        },
    });
    const { workspace } = useWorkspace();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-4 w-4 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-2 w-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    className="text-red-500 focus:text-red-400"
                    onClick={() =>
                        execute({
                            workspaceId: workspace.id,
                            userId: member.id,
                        })
                    }
                >
                    Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
