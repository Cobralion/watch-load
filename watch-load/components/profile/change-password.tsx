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
  InputGroupInput,
  InputGroupAddon,
} from '../ui/input-group';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import {
  ChangePasswordFormData,
  changePasswordSchema,
} from '@/lib/validations/auth';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useForm } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';

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

  const togglePassword = (id: string) =>
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: standardSchemaResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    console.log('Form Data:', data);
  };

  return (
    <Card>
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-neutral-400" />
          <CardTitle>Change Password</CardTitle>
        </div>
        <CardDescription>
          Leave blank if you don&apos;t want to change your password.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5">
        <form onSubmit={handleSubmit(onSubmit)}>
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
                    {...register(name)}
                    id={`form-changepwd-${id}`}
                    type={showPasswords[id] ? 'text' : 'password'}
                    aria-invalid={!!errors[name]}
                    autoComplete="off"
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
                {errors[name] && <FieldError errors={[errors[name]]} />}
              </Field>
            ))}

            {errors.root && (
                <p className="text-sm font-medium text-red-500">
                  {errors.root.message}
                </p>
              )}

            <Field orientation="horizontal">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Changing password...' : 'Change Password'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
