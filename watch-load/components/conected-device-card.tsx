'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Activity, Watch } from 'lucide-react';
import { disconnectDevices } from '@/actions/disconnect-devices';
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/app/(dashboard)/workspace/[workspaceSlug]/workspace-provider';
import { useAction } from 'next-safe-action/hooks';

export default function ConnectedDevicesCard({
    initialConnectionStatus,
}: {
    initialConnectionStatus: boolean;
}) {
    const { workspace } = useWorkspace();
    const [connectionStatus, setConnectionStatus] = useState(
        initialConnectionStatus
    );

    useEffect(() => {
        setConnectionStatus(initialConnectionStatus);
    }, [initialConnectionStatus]);

    const { execute, result, status, isExecuting } = useAction(
        disconnectDevices,
        {
            onSuccess: () => {
                setConnectionStatus(false);
            },
        }
    );

    return (
        <Card className="w-full max-w-sm overflow-hidden">
            <CardHeader>
                <div className="flex items-center gap-2.5">
                    <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-xl">
                        <Activity className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle>Connect Device</CardTitle>
                </div>

                <CardDescription className="mt-1">
                    Link your Withings device to start syncing health data
                    automatically.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white shadow-sm">
                        <Watch className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-700">
                            Withings Health
                        </p>
                        <p className="text-xs text-neutral-400">ECG</p>
                    </div>
                    <div className="ml-auto">
                        {connectionStatus ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                Linked
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                Not linked
                            </span>
                        )}
                    </div>
                </div>

                {connectionStatus ? (
                    <Button
                        variant="destructive"
                        className="h-10 w-full cursor-pointer"
                        onClick={() =>
                            workspace?.id &&
                            execute({ workspaceId: workspace?.id })
                        }
                        disabled={isExecuting || !workspace?.id}
                    >
                        Disconnect Device
                    </Button>
                ) : (
                    <Button asChild className="h-10 w-full cursor-pointer">
                        {workspace?.slug ? (
                            <Link
                                href={`/api/withings/connect?workspace=${workspace?.id}`}
                                rel="noreferrer"
                                target="_self"
                            >
                                Connect Withings Device
                            </Link>
                        ) : (
                            <span>Loading...</span>
                        )}
                    </Button>
                )}

                {status === 'hasSucceeded' && (
                    <div className="rounded-md bg-green-100 p-4 text-green-700">
                        <p className="text-sm">Disconnection successful!</p>
                    </div>
                )}

                {status === 'hasErrored' && (
                    <div className="rounded-md bg-red-100 p-4 text-red-700">
                        <p className="text-sm">
                            {result.serverError ||
                                'An error occurred during disconnection.'}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
