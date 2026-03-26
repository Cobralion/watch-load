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
import { listHeartAction } from '@/actions/heart';
import { DataTable } from '@/components/dashboard/ecg-data-table';

export function ECGCard({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ECG Table</CardTitle>
                <CardDescription>Card Description</CardDescription>
                <CardAction>
                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={async () => await listHeartAction()}
                    >
                        Pull updates
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
