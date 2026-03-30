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
import { useTransition } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export function EcgCard({ children }: React.ComponentProps<'div'>) {
    const [isSyncPending, startSyncTransaction] = useTransition();

    const handleSync = async () => {
        startSyncTransaction(async () => {
            const result = await syncHeartAction();

            if (!result.success) {
                toast.error(
                    result.message ??
                        'An error occurred while syncing heart data.',
                    { position: 'top-right' }
                );
                return;
            }

            toast.success('Successfully synced heart data.', {
                position: 'top-right',
            });
        });
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>ECG Table</CardTitle>
                <CardDescription>Card Description</CardDescription>
                <CardAction className="flex gap-2">
                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={handleSync}
                        disabled={isSyncPending}
                    >
                        {isSyncPending ? 'Syncing...' : 'Sync Now'}
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
