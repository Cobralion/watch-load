'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { AsyncUserSearch } from '@/components/workspace-settings/async-user-command';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { addNewUser } from '@/actions/workspace';

interface AddMemberDialogProps {
    workspaceId: string;
}

export function AddMemberDialog({ workspaceId }: AddMemberDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    // Initialize the submission action
    const { result, execute, isExecuting } = useAction(addNewUser, {
        onSuccess: () => {
            // Teardown sequence on successful mutation
            setOpen(false);
            setSelectedUser(null);
        },
        onError: ({ error }) => {},
    });

    const handleSubmit = () => {
        // TODO: handle no selected user
        if (!selectedUser) {
            return;
        }
        execute({
            workspaceId,
            userId: selectedUser,
        });
    };

    // Handle modal closure, ensuring state is reset if user cancels
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) setSelectedUser(null);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Members</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Members</DialogTitle>
                    <DialogDescription>
                        Search for users to grant them access to this workspace.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <AsyncUserSearch
                        selected={selectedUser}
                        onChange={setSelectedUser}
                        workspaceId={workspaceId}
                    />
                </div>

                {result?.serverError && (
                    <p className="text-sm font-medium text-red-500">
                        {result.serverError}
                    </p>
                )}

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedUser || isExecuting}
                    >
                        {isExecuting ? 'Adding...' : 'Add Selected'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
