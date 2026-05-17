'use client';

import { LocationOption } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { editLocationSchema } from '@/lib/validations/workspace';
import { editLocation } from '@/actions/workspace';
import { toast } from 'sonner';

export interface ManageLocationOptionProps {
    editingId: string | null;
    workspaceId: string;
    locationOption: LocationOption;
    startEditing: (id: string) => void;
    cancelEditing: () => void;
    deleteLocation: (id: string) => void;
}

export default function ManageLocationOption({
    locationOption,
    workspaceId,
    startEditing,
    editingId,
    cancelEditing,
    deleteLocation,
}: ManageLocationOptionProps) {
    const { form, action, handleSubmitWithAction } = useHookFormAction(
        editLocation,
        standardSchemaResolver(editLocationSchema),
        {
            formProps: {
                values: {
                    id: locationOption.id,
                    workspaceId,
                    name: locationOption.name ?? '',
                },
            },
            actionProps: {
                onSuccess: ({ data }) => {
                    form.reset({ id: data.id, name: data.name, workspaceId });
                    toast.success(
                        `Location updated successfully to ${data.name}.`,
                        { position: 'top-right' }
                    );
                    cancelEditing();
                },
                onError: ({ error }) => {
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
            },
        }
    );

    const cancel = () => {
        form.reset();
        cancelEditing();
    };

    const { errors } = form.formState;

    return (
        <div className="group hover:bg-muted/50 flex items-center justify-between rounded-md border px-3 py-2 transition-colors">
            {editingId === locationOption.id ? (
                <div className="flex w-full items-start gap-2">
                    <form
                        onSubmit={handleSubmitWithAction}
                        className="flex flex-1 items-start gap-2"
                    >
                        <div className="flex w-full flex-col gap-1">
                            <Input
                                {...form.register('name')}
                                id={`edit-location-name-${locationOption.id}`}
                                type="text"
                                className="h-8"
                                autoFocus
                                disabled={action.isExecuting}
                            />

                            <Input
                                type="hidden"
                                {...form.register('workspaceId')}
                            />
                            {/* Inline validation error display */}
                            {errors.name && (
                                <span className="text-destructive text-xs font-medium">
                                    {errors.name.message as string}
                                </span>
                            )}
                        </div>

                        <Button
                            size="icon"
                            variant="ghost"
                            type="submit"
                            disabled={action.isExecuting}
                            className="shrink-0"
                        >
                            {action.isExecuting ? (
                                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 text-green-600" />
                            )}
                        </Button>
                    </form>

                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={cancel}
                        disabled={action.isExecuting}
                        className="shrink-0"
                    >
                        <X className="h-4 w-4 text-red-600" />
                    </Button>
                </div>
            ) : (
                <>
                    <span className="text-sm font-medium">
                        {locationOption.name}
                    </span>

                    <div className="flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:shadow-xs"
                            onClick={() => startEditing(locationOption.id)}
                        >
                            <Pencil className="text-muted-foreground h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:shadow-xs"
                            onClick={() => deleteLocation(locationOption.id)}
                        >
                            <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
