'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { LocationOption } from '@/types/workspace';
import ManageLocationCreate from '@/components/workspace-settings/manage-location-create';
import ManageLocationOption from '@/components/workspace-settings/manage-location-option';
import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { deleteLocation } from '@/actions/workspace';
import { toast } from 'sonner';

export function LocationSettings({
    initialOptions,
    workspaceId,
}: {
    initialOptions: LocationOption[];
    workspaceId: string;
}) {
    const [editingId, setEditingId] = useState<string | null>(null);

    const { execute, isExecuting } = useAction(deleteLocation, {
        onSuccess: () => {
            setEditingId(null);
            toast.success(`Location was successfully removed.`, {
                position: 'top-right',
            });
        },
        onError: ({ error }) => {
            setEditingId(null);

            if (error.serverError) {
                toast.error(error.serverError, {
                    position: 'top-right',
                });
            } else {
                toast.error('An unexpected error occurred.', {
                    position: 'top-right',
                });
            }
        },
    });

    const handleDelete = (id: string) => {
        if (isExecuting) return;
        execute({ id, workspaceId });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Measurement Locations</CardTitle>
                <CardDescription>
                    Define the location options available for measurements in
                    this workspace.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Creation Input */}
                <ManageLocationCreate
                    workspaceId={workspaceId}
                ></ManageLocationCreate>

                {/* Options List */}
                <div className="space-y-2">
                    {initialOptions.length === 0 ? (
                        <p className="text-muted-foreground py-4 text-center text-sm">
                            No options defined yet.
                        </p>
                    ) : (
                        initialOptions.map((option) => (
                            <ManageLocationOption
                                key={option.id}
                                locationOption={option}
                                workspaceId={workspaceId}
                                editingId={editingId}
                                startEditing={setEditingId}
                                cancelEditing={() => setEditingId(null)}
                                deleteLocation={handleDelete}
                            ></ManageLocationOption>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
