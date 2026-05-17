'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Trash2, TriangleAlert } from 'lucide-react';

interface DeleteWorkspaceDialogProps {
    workspaceName: string;
    workspaceSlug: string;
    onDelete: () => void | Promise<void>;
}

export function DeleteWorkspaceDialog({
    workspaceName,
    workspaceSlug,
    onDelete,
}: DeleteWorkspaceDialogProps) {
    const [open, setOpen] = useState(false);
    const [confirmValue, setConfirmValue] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const isConfirmed = confirmValue === workspaceSlug;

    const handleDelete = async () => {
        if (!isConfirmed) return;
        setIsDeleting(true);
        try {
            await onDelete();
            setOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) setConfirmValue('');
        setOpen(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Delete Workspace
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="bg-destructive/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                            <AlertTriangle className="text-destructive h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-left text-lg">
                                Delete workspace
                            </DialogTitle>
                            <DialogDescription className="text-left">
                                This action is permanent and cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Danger callout */}
                    <Alert
                        variant="destructive"
                        className="border-destructive/50 bg-destructive/5"
                    >
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle className="font-semibold">
                            Critical — application-wide impact
                        </AlertTitle>
                        <AlertDescription className="mt-1 text-sm leading-relaxed">
                            Deleting{' '}
                            <span className="text-foreground font-semibold">
                                {workspaceName}
                            </span>{' '}
                            will permanently remove all ecg data, members,
                            settings, connected accounts, and any associated
                            data. This workspace will immediately stop working
                            and{' '}
                            <span className="text-foreground font-semibold">
                                cannot be recovered
                            </span>
                            .
                        </AlertDescription>
                    </Alert>

                    {/* Consequences list */}
                    <ul className="text-muted-foreground space-y-1.5 text-sm">
                        {[
                            'All workspace data will be erased - there are NO BACKUPS',
                            'All team members will lose access immediately',
                            'Active account connections will be revoked',
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                                <span className="text-destructive mt-0.5">
                                    ✕
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    {/* Slug confirmation */}
                    <div className="border-border bg-muted/40 space-y-2 rounded-md border p-4">
                        <Label
                            htmlFor="confirm-slug"
                            className="text-sm font-medium"
                        >
                            Type{' '}
                            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                                {workspaceSlug}
                            </code>{' '}
                            to confirm deletion
                        </Label>
                        <Input
                            id="confirm-slug"
                            placeholder={workspaceSlug}
                            value={confirmValue}
                            onChange={(e) => setConfirmValue(e.target.value)}
                            className="font-mono text-sm"
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!isConfirmed || isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Deleting…
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete workspace permanently
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
