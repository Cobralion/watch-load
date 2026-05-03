'use client';

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
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { Input } from '@/components/ui/input';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { loginSchema } from '@/lib/validations/auth';
import { login } from '@/actions/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleCheck } from 'lucide-react';
import { use } from 'react';

export function LoginForm({
    searchParams,
}: {
    searchParams: Promise<{ username?: string; reset_success?: string }>;
}) {
    const params = use(searchParams);
    const username = params.username || '';
    const resetSuccess = params.reset_success === '1';

    const { form, action, handleSubmitWithAction } = useHookFormAction(
        login,
        standardSchemaResolver(loginSchema),
        {
            formProps: {
                defaultValues: {
                    username: username,
                    password: '',
                },
            },
        }
    );

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username and password below to login.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {resetSuccess && (
                        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                            <CircleCheck className="h-4 w-4 !text-green-600" />
                            <AlertTitle>Password reset successful</AlertTitle>
                            <AlertDescription className="text-green-700">
                                You can now log in with your new password.
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmitWithAction}>
                        <FieldGroup>
                            <Field
                                key="username"
                                data-invalid={!!form.formState.errors.username}
                            >
                                <FieldLabel htmlFor="form-login-username">
                                    Username
                                </FieldLabel>
                                <Input
                                    {...form.register('username')}
                                    id="form-login-username"
                                    type="text"
                                    aria-invalid={
                                        !!form.formState.errors.username
                                    }
                                    autoComplete="username"
                                />
                                {form.formState.errors.username && (
                                    <FieldError
                                        errors={[
                                            form.formState.errors.username,
                                        ]}
                                    />
                                )}
                            </Field>

                            <Field
                                key="password"
                                data-invalid={!!form.formState.errors.password}
                            >
                                <FieldLabel htmlFor="form-login-password">
                                    Password
                                </FieldLabel>
                                <Input
                                    {...form.register('password')}
                                    id="form-login-password"
                                    type="password"
                                    aria-invalid={
                                        !!form.formState.errors.password
                                    }
                                    autoComplete="current-password"
                                />
                                {form.formState.errors.password && (
                                    <FieldError
                                        errors={[
                                            form.formState.errors.password,
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
                                        ? 'Logging in...'
                                        : 'Login'}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
