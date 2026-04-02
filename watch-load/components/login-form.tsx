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
import { useForm } from 'react-hook-form';
import { LoginFormData, loginSchema } from '@/lib/validations/auth';
import { useRouter } from 'next/navigation';
import { login } from '@/actions/auth';

const FIELDS = [
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'password', label: 'Password', type: 'password' },
] as const;

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const { form, action, handleSubmitWithAction } = useHookFormAction(
        login,
        standardSchemaResolver(loginSchema),
        {
            formProps: {
                defaultValues: {
                    username: '',
                    password: '',
                },
            },
        }
    );

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username and password below to login.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
