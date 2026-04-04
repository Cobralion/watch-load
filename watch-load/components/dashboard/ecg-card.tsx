'use client';

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { syncHeartAction } from '@/actions/heart';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAction } from 'next-safe-action/hooks';
import { useWorkspace } from '@/app/(dashboard)/workspace/[workspaceSlug]/workspace-provider';

export function EcgCard({ children }: React.ComponentProps<'div'>) {
    const workspaceContext = useWorkspace();

    const { execute, isExecuting } = useAction(syncHeartAction, {
        onSuccess: () => {
            toast.success('Successfully synced heart data.', {
                position: 'top-right',
            });
        },
        onError: (error) => {
            toast.error(error.error.serverError, { position: 'top-right' });
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>ECG Table</CardTitle>
                <CardDescription>Card Description</CardDescription>
                <CardAction className="flex gap-2">
                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={() => {
                            execute({
                                workspaceId: workspaceContext.workspace.id,
                            });
                        }}
                        disabled={isExecuting}
                    >
                        {isExecuting ? 'Syncing...' : 'Sync Now'}
                    </Button>

                    <Button className="cursor-pointer" variant="ghost">
                        <Link href="/api/ecg/download">Download Excel</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>{children}</CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>
    );
}
