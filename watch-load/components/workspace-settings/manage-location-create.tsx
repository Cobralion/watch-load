'use client';

import { useAction, useOptimisticAction } from 'next-safe-action/hooks';
import { createLocation } from '@/actions/workspace';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { createLocationSchema } from '@/lib/validations/workspace';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';

export default function ManageLocationCreate({
    workspaceId,
}: {
    workspaceId: string;
}) {
    const { form, action, handleSubmitWithAction, resetFormAndAction } =
        useHookFormAction(
            createLocation,
            standardSchemaResolver(createLocationSchema),
            {
                formProps: {
                    defaultValues: {
                        name: '',
                        workspaceId,
                    },
                },
                actionProps: {
                    onSuccess: ({ data }) => {
                        resetFormAndAction();
                    },
                    onError: ({ error }) => {
                        if (error.serverError) {
                            toast.error(error.serverError, {
                                position: 'top-right',
                            });
                        }
                    },
                },
            }
        );

    return (
        <form onSubmit={handleSubmitWithAction}>
            <FieldGroup>
                <Field
                    className="flex flex-col gap-1"
                    key="create-location-name"
                    data-invalid={!!form.formState.errors.name}
                >
                    <div className="flex items-center gap-2">
                        <Input
                            {...form.register('name')}
                            id="form-create-location-name"
                            type="text"
                            className="flex-1"
                            aria-invalid={!!form.formState.errors.name}
                        />
                        <Button className="w-25 shrink-0" type="submit">
                            Add
                        </Button>
                    </div>

                    {form.formState.errors.name && (
                        <FieldError errors={[form.formState.errors.name]} />
                    )}
                </Field>
            </FieldGroup>
        </form>
    );
}
