'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '../ui/input-group';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { changePasswordSchema } from '@/lib/validations/auth';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { changePassword } from '@/actions/change-password';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { toast } from 'sonner';

const FIELDS = [
    {
        id: 'current-password',
        name: 'currentPassword',
        label: 'Current Password',
    },
    { id: 'new-password', name: 'newPassword', label: 'New Password' },
    {
        id: 'confirm-password',
        name: 'confirmPassword',
        label: 'Confirm New Password',
    },
] as const;

export default function ChangePassword() {
    const [showPasswords, setShowPasswords] = useState({
        'current-password': false,
        'new-password': false,
        'confirm-password': false,
    });

    const togglePassword = (id: keyof typeof showPasswords) =>
        setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));

    const { form, action, handleSubmitWithAction } = useHookFormAction(
        changePassword,
        standardSchemaResolver(changePasswordSchema),
        {
            formProps: {
                defaultValues: {
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                },
            },
            actionProps: {
                onSuccess: () => {
                    toast.success('Password changed successfully!', {
                        position: 'top-right',
                    });
                    form.reset();
                    setShowPasswords({
                        'current-password': false,
                        'new-password': false,
                        'confirm-password': false,
                    });
                },
            },
        }
    );

    return (
        <Card>
            <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-neutral-400" />
                    <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                    Change your password at any time.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-5 pb-5">
                <form onSubmit={handleSubmitWithAction}>
                    <FieldGroup>
                        {FIELDS.map(({ id, name, label }) => (
                            <Field key={id}>
                                <FieldLabel
                                    htmlFor={`form-changepwd-${id}`}
                                    className="text-xs font-medium text-neutral-600"
                                >
                                    {label}
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        {...form.register(name)}
                                        id={`form-changepwd-${id}`}
                                        type={
                                            showPasswords[id]
                                                ? 'text'
                                                : 'password'
                                        }
                                        aria-invalid={
                                            !!form.formState.errors[name]
                                        }
                                        autoComplete={
                                            name === 'currentPassword'
                                                ? 'current-password'
                                                : 'new-password'
                                        }
                                    />
                                    <InputGroupAddon
                                        onClick={() => togglePassword(id)}
                                        align="inline-end"
                                    >
                                        {showPasswords[id] ? (
                                            <EyeOff className="h-4 w-4 cursor-pointer" />
                                        ) : (
                                            <Eye className="h-4 w-4 cursor-pointer" />
                                        )}
                                    </InputGroupAddon>
                                </InputGroup>
                                {form.formState.errors[name] && (
                                    <FieldError
                                        errors={[form.formState.errors[name]]}
                                    />
                                )}
                            </Field>
                        ))}

                        {action.result.serverError && (
                            <p className="text-sm font-medium text-red-500">
                                {action.result.serverError}
                            </p>
                        )}

                        <Field orientation="horizontal">
                            <Button
                                className="cursor-pointer"
                                type="submit"
                                disabled={action.isPending}
                            >
                                {action.isPending
                                    ? 'Changing password...'
                                    : 'Change Password'}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
