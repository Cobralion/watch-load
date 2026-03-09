'use server';

import { LoginFormData, loginSchema } from '@/lib/validations/auth';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import AuthState from '@/types/auth-state';

export async function login(formData: LoginFormData): Promise<AuthState> {
  const validation = await loginSchema.safeParseAsync(formData);
  if (!validation.success) throw new Error('Invalid form data.');

  const { username, password } = validation.data;

  try {
    await signIn('credentials', { username, password, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error:
          error.type === 'CredentialsSignin'
            ? 'Invalid username or password.'
            : 'An unknown authentication error occurred.',
      };
    }
    throw error;
  }
}
