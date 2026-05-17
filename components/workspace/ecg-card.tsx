'use client';

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
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
        onError: ({ error }) => {
            toast.error(error.serverError, { position: 'top-right' });
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>ECG Annotation Workspace</CardTitle>
                <CardDescription>
                    Here you can annotation your wearable ECGs.
                </CardDescription>
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
                        <Link
                            href={`/api/ecg/download?workspace=${workspaceContext.workspace.id}&format=csv`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Export CSV
                        </Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
