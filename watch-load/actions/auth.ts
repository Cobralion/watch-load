'use server';

import { loginSchema, resetPasswordSchema } from '@/lib/validations/auth';
import { signIn } from '@/lib/auth';
import { AuthError, CredentialsSignin } from 'next-auth';
import { publicActionClient } from '@/lib/safe-action';
import { ActionError, ResetCredentialsError } from '@/types/errors';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { sha256Hex } from '@/lib/utils';
import bcrypt from 'bcryptjs';

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
                    throw new ActionError(
                        'You have to reset your password. Please ask your administrator for password reset link.'
                    );
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

export const resetPassword = publicActionClient
    .inputSchema(resetPasswordSchema)
    .action(async ({ parsedInput }): Promise<void> => {
        const { username, password, resetToken } = parsedInput;

        let user: {
            id: string;
            resetToken: string | null;
            resetTokenExpiresAt: Date;
        } | null;

        try {
            user = await prisma.user.findFirst({
                where: { username: username },
                select: {
                    id: true,
                    resetToken: true,
                    resetTokenExpiresAt: true,
                },
            });
        } catch (error) {
            console.error(error);
            throw new ActionError('Could not reset password.');
        }

        if (!user) {
            throw new ActionError('Could not reset password.');
        }

        if (user.resetTokenExpiresAt < new Date()) {
            throw new ActionError(
                'Reset link expired. Ask your administrator for a new one.'
            );
        }

        const resetTokenHash = sha256Hex(resetToken);
        if (user.resetToken !== resetTokenHash) {
            throw new ActionError(
                'Reset link is not valid. Ask your administrator for a new one.'
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        try {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: passwordHash,
                    resetToken: null,
                    resetTokenExpiresAt: new Date(),
                },
            });
        } catch (error) {
            console.error(error);
            throw new ActionError('Could not reset password.');
        }

        redirect('/login');
    });
