'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ResetPasswordError({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                <CircleAlert className="h-4 w-4 !text-red-600" />
                <AlertTitle>{message}</AlertTitle>
            </Alert>

            <Button asChild variant="outline">
                <Link href="/login">Back to login</Link>
            </Button>
        </div>
    );
}
