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
import { disconnectDevices } from '@/actions/conect-devices';
import { useState } from 'react';
import { ActionState } from '@/types/action-state';

export default function ConnectedDevicesCard(initialConnectionStatus: boolean) {
    const [disconnectState, setDisconnectState] = useState<ActionState | null>(
        null
    );
    const [connectionStatus, setConnectionStatus] = useState(
        initialConnectionStatus
    );

    async function handleDisconnect() {
        const result = await disconnectDevices();
        setDisconnectState(result);
        if (result.success) {
            setConnectionStatus(false);
        }
    }

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
                            <>
                                <span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                    Linked
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    Not linked
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {connectionStatus ? (
                    <Button
                        variant="destructive"
                        className="h-10 w-full cursor-pointer"
                        onClick={async () => await handleDisconnect()}
                    >
                        Disconnect Device
                    </Button>
                ) : (
                    <Button asChild className="h-10 w-full cursor-pointer">
                        <Link href="/api/withings/connect" target="_blank">
                            Connect Withings Device
                        </Link>
                    </Button>
                )}

                {disconnectState && (
                    <div
                        className={`rounded-md p-4 ${
                            disconnectState.success
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        <p className="text-sm">{disconnectState.message}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
