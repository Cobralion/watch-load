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
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { createUser } from '@/actions/admin';
import { createUserSchema } from '@/lib/validations/admin';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import {toast} from "sonner";

interface AdminCreateUserCardProps {}

export default function AdminCreateUserCard(props: AdminCreateUserCardProps) {
    const { form, action, handleSubmitWithAction, resetFormAndAction } =
        useHookFormAction(
            createUser,
            standardSchemaResolver(createUserSchema),
            {
                formProps: {
                    defaultValues: {
                        name: '',
                        username: '',
                        admin: false,
                    },
                },
                actionProps: {
                    onSuccess: ({ data }) => {
                        toast.success(`User ${data.username} created successfully!`, {position: 'top-right'});
                        resetFormAndAction();
                    },
                    onError: ({error}) => {
                      toast.error(error.serverError, {position: 'top-right'});
                    },
                },
            }
        );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create User</CardTitle>
                <CardDescription>Create a new user.</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmitWithAction}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="admin-create-user-name">
                                Name
                            </FieldLabel>
                            <Input
                                {...form.register('name')}
                                id="admin-create-user-name"
                                placeholder="Max Mustermann"
                                aria-invalid={!!form.formState.errors['name']}
                                required
                            />

                            {form.formState.errors['name'] && (
                                <FieldError
                                    errors={[form.formState.errors['name']]}
                                />
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="admin-create-user-username">
                                Username
                            </FieldLabel>
                            <Input
                                {...form.register('username')}
                                id="admin-create-user-username"
                                placeholder="maxmuster"
                                aria-invalid={
                                    !!form.formState.errors['username']
                                }
                                required
                            />

                            {form.formState.errors['username'] && (
                                <FieldError
                                    errors={[form.formState.errors['username']]}
                                />
                            )}
                        </Field>

                        <Controller
                            control={form.control}
                            name="admin"
                            render={({ field }) => (
                                <div className="flex items-center gap-10">
                                    <Label htmlFor="admin-create-user-admin">
                                        Administrator
                                    </Label>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="admin-create-user-admin"
                                    />
                                </div>
                            )}
                        />

                        <Field
                            className="flex justify-end-safe"
                            orientation="horizontal"
                        >
                            <Button type="submit" disabled={action.isExecuting}>
                                {action.isExecuting
                                    ? 'Creating User...'
                                    : 'Create User'}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
