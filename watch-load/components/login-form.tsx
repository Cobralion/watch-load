'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useForm } from 'react-hook-form';
import { LoginFormData, loginSchema } from '@/lib/validations/auth';
import { useRouter } from 'next/navigation';
import { login } from '@/actions/auth';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

const FIELDS = [
  { name: 'username', label: 'Username', type: 'text' },
  { name: 'password', label: 'Password', type: 'password' },
] as const;

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const { status } = useSession();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard');
  }, [status, router]);

  async function onSubmit(data: LoginFormData) {
    const result = await login(data);
    if (result?.error) {
      setError('root', { type: 'manual', message: 'Invalid username or password.' });
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your username and password below to login.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {FIELDS.map(({ name, label, type }) => (
                <Field key={name} data-invalid={!!errors[name]}>
                  <FieldLabel htmlFor={`form-login-${name}`}>{label}</FieldLabel>
                  <Input
                    {...register(name)}
                    id={`form-login-${name}`}
                    type={type}
                    aria-invalid={!!errors[name]}
                    autoComplete="off"
                  />
                  {errors[name] && <FieldError errors={[errors[name]]} />}
                </Field>
              ))}

              {errors.root && (
                <p className="text-sm font-medium text-red-500">{errors.root.message}</p>
              )}

              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}