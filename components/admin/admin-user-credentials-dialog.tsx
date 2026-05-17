'use client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export interface AdminUserCredentialsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    credentials: {
        username: string;
        resetUrl: string;
    } | null;
}

export default function AdminUserCredentialsDialog({
    open,
    onOpenChange,
    credentials,
}: AdminUserCredentialsDialogProps) {
    const text = `Username: ${credentials?.username}\nHere you can reset your password:\n${credentials?.resetUrl}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="mx-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New User</DialogTitle>
                    <DialogDescription>
                        This is the new user&#39;s credentials. Make sure to
                        copy them before closing the dialog, as you won&#39;t be
                        able to see them again.
                    </DialogDescription>
                </DialogHeader>
                <Textarea value={text} readOnly />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button
                        variant="ghost"
                        onClick={async () =>
                            await navigator.clipboard.writeText(text)
                        }
                    >
                        Copy
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
