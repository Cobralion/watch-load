'use client';

import { ColumnDef, Row } from '@tanstack/react-table';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import {
    generatePasswordResetLink,
    removeGlobalUser,
    toggleGlobalAdmin,
} from '@/actions/admin';
import { toast } from 'sonner';
import { useState } from 'react';
import AdminUserCredentialsDialog from '@/components/admin/admin-user-credentials-dialog';
import { GlobalUser } from '@/types/admin';

export const columns: ColumnDef<GlobalUser>[] = [
    {
        accessorKey: 'username',
        header: 'Username',
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'isGlobalAdmin',
        header: 'Admin',
        cell: ({ row }) => <RoleSwitchCell row={row} />,
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionsDropdownCell row={row} />,
    },
];

interface RoleSwitchCellProps {
    row: Row<GlobalUser>;
}

export const RoleSwitchCell = ({ row }: RoleSwitchCellProps) => {
    const user = row.original;
    const { execute, isExecuting } = useAction(toggleGlobalAdmin, {
        onError: ({ error }) => {
            toast.error(error.serverError, { position: 'top-right' });
        },
    });

    return (
        <Switch
            checked={user.isGlobalAdmin}
            onCheckedChange={() =>
                execute({
                    userId: user.id,
                    isAdmin: !user.isGlobalAdmin,
                })
            }
            disabled={isExecuting}
        />
    );
};

interface ActionsDropdownCellProps {
    row: Row<GlobalUser>;
}

export const ActionsDropdownCell = ({ row }: ActionsDropdownCellProps) => {
    const user = row.original;
    const [credentials, setCredentials] = useState<{
        username: string;
        resetUrl: string;
    } | null>(null);
    const [credentialsOpen, setCredentialsOpen] = useState(false);
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

    const resetLinkAction = useAction(generatePasswordResetLink, {
        onSuccess: ({ data }) => {
            if (!data) return;
            setCredentials({
                username: data.username,
                resetUrl: data.resetUrl,
            });
            setCredentialsOpen(true);
        },
        onError: ({ error }) => {
            toast.error(error.serverError, { position: 'top-right' });
        },
    });

    const removeAction = useAction(removeGlobalUser, {
        onError: ({ error }) => {
            toast.error(error.serverError, { position: 'top-right' });
        },
    });

    const handleCredentialsClose = () => {
        setCredentialsOpen(false);
        setCredentials(null);
    };

    return (
        <>
            {credentials && (
                <AdminUserCredentialsDialog
                    open={credentialsOpen}
                    onOpenChange={handleCredentialsClose}
                    credentials={credentials}
                />
            )}
            <AlertDialog
                open={confirmRemoveOpen}
                onOpenChange={setConfirmRemoveOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{' '}
                            <strong>{user.username}</strong> and remove them
                            from every workspace they belong to. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() =>
                                removeAction.execute({ userId: user.id })
                            }
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        disabled={resetLinkAction.isExecuting}
                        onClick={() =>
                            resetLinkAction.execute({ userId: user.id })
                        }
                    >
                        Generate reset link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-500 focus:text-red-400"
                        onClick={() => setConfirmRemoveOpen(true)}
                    >
                        Remove
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
