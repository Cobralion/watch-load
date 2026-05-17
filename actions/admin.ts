'use server';

import { actionClient } from '@/lib/safe-action';
import {
    CreateUserOutput,
    createUserOutputSchema,
    createUserSchema,
    GeneratePasswordResetLinkOutput,
    generatePasswordResetLinkOutputSchema,
    generatePasswordResetLinkSchema,
    removeGlobalUserSchema,
    toggleGlobalAdminSchema,
} from '@/lib/validations/admin';
import { prisma } from '@/lib/prisma';
import { GlobalRole } from '@/generated/prisma/enums';
import { randomBytes } from 'node:crypto';
import { ActionError } from '@/types/errors';
import { env } from '@/env';
import { Prisma } from '@/generated/prisma/client';
import { sha256Hex } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

function mintResetToken(username: string): {
    plainToken: string;
    hashedToken: string;
    expiresAt: Date;
    resetUrl: string;
} {
    const plainToken = randomBytes(32).toString('hex');
    const hashedToken = sha256Hex(plainToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    const url = new URL(`${env.APP_URL}/reset-password`);
    url.searchParams.set('username', username);
    url.searchParams.set('reset_token', plainToken);

    return {
        plainToken,
        hashedToken,
        expiresAt,
        resetUrl: url.toString(),
    };
}

export const createUser = actionClient
    .metadata({ actionName: 'createUser', requiredRole: 'ADMIN' })
    .inputSchema(createUserSchema)
    .outputSchema(createUserOutputSchema)
    .action(async ({ parsedInput }): Promise<CreateUserOutput> => {
        const { hashedToken, expiresAt, resetUrl } = mintResetToken(
            parsedInput.username
        );
        const role = parsedInput.admin ? GlobalRole.ADMIN : GlobalRole.USER;

        let user: {
            name: string | null;
            username: string;
            role: GlobalRole;
            id: string;
            password: string | null;
            resetToken: string | null;
            resetTokenExpiresAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };

        try {
            user = await prisma.user.create({
                data: {
                    username: parsedInput.username,
                    password: null,
                    name: parsedInput.name,
                    role,
                    resetToken: hashedToken,
                    resetTokenExpiresAt: expiresAt,
                },
            });
        } catch (error) {
            console.error(error);
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ActionError('Username is already taken.');
            }

            throw new ActionError(`Failed to create user.`);
        }

        revalidatePath('/admin');
        return {
            username: user.username,
            role: user.role,
            resetUrl,
        };
    });

export const toggleGlobalAdmin = actionClient
    .metadata({ actionName: 'toggleGlobalAdmin', requiredRole: 'ADMIN' })
    .inputSchema(toggleGlobalAdminSchema)
    .action(async ({ parsedInput: { userId, isAdmin }, ctx }) => {
        if (userId === ctx.userId) {
            throw new ActionError(
                'You cannot alter your own administrator rights.'
            );
        }

        const target = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!target) {
            throw new ActionError('User does not exist.');
        }

        if (target.role === GlobalRole.ADMIN) {
            throw new ActionError(
                "You cannot alter another administrator's rights."
            );
        }

        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    role: isAdmin ? GlobalRole.ADMIN : GlobalRole.USER,
                },
            });
        } catch (error) {
            console.error(error);
            throw new ActionError('Could not update user role.');
        }

        revalidatePath('/admin');
    });

export const removeGlobalUser = actionClient
    .metadata({ actionName: 'removeGlobalUser', requiredRole: 'ADMIN' })
    .inputSchema(removeGlobalUserSchema)
    .action(async ({ parsedInput: { userId }, ctx }) => {
        if (userId === ctx.userId) {
            throw new ActionError('You cannot remove yourself.');
        }

        const target = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!target) {
            throw new ActionError('User does not exist.');
        }

        if (target.role === GlobalRole.ADMIN) {
            throw new ActionError('You cannot remove another administrator.');
        }

        try {
            await prisma.user.delete({ where: { id: userId } });
        } catch (error) {
            console.error(error);
            throw new ActionError('Could not remove user.');
        }

        revalidatePath('/admin');
    });

export const generatePasswordResetLink = actionClient
    .metadata({
        actionName: 'generatePasswordResetLink',
        requiredRole: 'ADMIN',
    })
    .inputSchema(generatePasswordResetLinkSchema)
    .outputSchema(generatePasswordResetLinkOutputSchema)
    .action(
        async ({
            parsedInput: { userId },
            ctx,
        }): Promise<GeneratePasswordResetLinkOutput> => {
            if (userId === ctx.userId) {
                throw new ActionError(
                    'You cannot generate a reset link for yourself.'
                );
            }

            const target = await prisma.user.findUnique({
                where: { id: userId },
                select: { username: true },
            });

            if (!target) {
                throw new ActionError('User does not exist.');
            }

            const { hashedToken, expiresAt, resetUrl } = mintResetToken(
                target.username
            );

            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        password: null,
                        resetToken: hashedToken,
                        resetTokenExpiresAt: expiresAt,
                    },
                });
            } catch (error) {
                console.error(error);
                throw new ActionError('Could not generate reset link.');
            }

            revalidatePath('/admin');

            return {
                username: target.username,
                resetUrl,
            };
        }
    );
