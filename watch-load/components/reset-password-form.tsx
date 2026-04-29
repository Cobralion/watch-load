'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from '@/components/ui/field';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { Input } from '@/components/ui/input';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { resetPassword } from '@/actions/auth';

export interface PasswordResetFormProps {
    username: string;
    resetToken: string;
}

export function ResetPasswordForm({ username, resetToken }: PasswordResetFormProps) {
    const { form, action, handleSubmitWithAction } = useHookFormAction(
        resetPassword,
        standardSchemaResolver(resetPasswordSchema),
        {
            formProps: {
                defaultValues: {
                    username: username,
                    resetToken: resetToken,
                    password: '',
                    confirmPassword: '',
                },
            },
        }
    );
    // TODO: add success message

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Reset password</CardTitle>
                    <CardDescription>
                        Choose a password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitWithAction}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="form-reset-username">
                                    Username
                                </FieldLabel>
                                <Input
                                    value={username}
                                    id="form-reset-username"
                                    type="text"
                                    disabled
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="form-reset-password">
                                    Password
                                </FieldLabel>
                                <Input
                                    {...form.register('password')}
                                    id="form-reset-password"
                                    type="password"
                                    aria-invalid={
                                        !!form.formState.errors.password
                                    }
                                    autoComplete="new-password"
                                />
                                {form.formState.errors.password && (
                                    <FieldError
                                        errors={[
                                            form.formState.errors.password,
                                        ]}
                                    />
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="form-reset-confirm-password">
                                    Confirm Password
                                </FieldLabel>
                                <Input
                                    {...form.register('confirmPassword')}
                                    id="form-reset-confirm-password"
                                    type="password"
                                    aria-invalid={
                                        !!form.formState.errors.confirmPassword
                                    }
                                    autoComplete="new-password"
                                />
                                {form.formState.errors.confirmPassword && (
                                    <FieldError
                                        errors={[
                                            form.formState.errors
                                                .confirmPassword,
                                        ]}
                                    />
                                )}
                            </Field>

                            {action.result?.serverError && (
                                <p className="text-sm font-medium text-red-500">
                                    {action.result.serverError}
                                </p>
                            )}

                            <Field>
                                <Button
                                    type="submit"
                                    disabled={action.isPending}
                                >
                                    {action.isPending
                                        ? 'Resetting password...'
                                        : 'Reset password'}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
