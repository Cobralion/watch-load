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
import { DataTable } from '@/components/dashboard/ecg-data-table';
import { useState, useTransition } from 'react';
import { SyncHeartActionState } from '@/types/action-states';
import {toast} from "sonner";

export function ECGCard({ className, ...props }: React.ComponentProps<'div'>) {
    const [isSyncPending, startSyncTransaction] = useTransition();

    const handleSync = async () => {
        startSyncTransaction(async () => {
            const result = await syncHeartAction();

            if (!result.success) {
                toast.error(
                    result.message ??
                        'An error occurred while syncing heart data.',
                    {position: 'top-right'}
                );
                return;
            }

            toast.success(
                'Successfully synced heart data.',
                { position: 'top-right' }
            );
        });
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>ECG Table</CardTitle>
                <CardDescription>Card Description</CardDescription>
                <CardAction>
                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={handleSync}
                        disabled={isSyncPending}
                    >
                        {isSyncPending ? 'Syncing...' : 'Sync Now'}
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                {/*<DataTable columns={} data={}></DataTable>*/}
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>
    );
}
