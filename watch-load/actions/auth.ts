'use server';

import { loginSchema } from '@/lib/validations/auth';
import { signIn } from '@/lib/auth';
import { AuthError, CredentialsSignin } from 'next-auth';
import { publicActionClient } from '@/lib/safe-action';
import { ActionError, ResetCredentialsError } from '@/types/errors';
import { redirect } from 'next/navigation';

export const login = publicActionClient
    .inputSchema(loginSchema)
    .action(async ({ parsedInput }): Promise<void> => {
        const { username, password } = parsedInput;

        let loginSuccess = false;
        try {
            loginSuccess = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });
        } catch (error) {
            console.error('Login action error: ', error);
            if (error instanceof AuthError) {
                if (error instanceof ResetCredentialsError) {
                    throw new ActionError('You have to reset your password. Please ask your administrator for password reset link.');
                }
                if (error instanceof CredentialsSignin) {
                    throw new ActionError('Invalid username or password.');
                }
            }
            throw new ActionError('An unknown authentication error occurred.');
        }

        if (loginSuccess) {
            redirect('/dashboard');
        }
    });
