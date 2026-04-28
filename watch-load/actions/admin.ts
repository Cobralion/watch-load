'use server';

import { actionClient } from '@/lib/safe-action';
import {
    CreateUserOutput,
    createUserOutputSchema,
    createUserSchema,
} from '@/lib/validations/admin';
import { prisma } from '@/lib/prisma';
import { GlobalRole } from '@/generated/prisma/enums';
import { randomBytes } from 'crypto';
import { ActionError } from '@/types/errors';
import { env } from '@/env';
import { Prisma } from '@/generated/prisma/client';
import { sha256Hex } from '@/lib/utils';

export const createUser = actionClient
    .metadata({ actionName: 'createUser', requiredRole: 'ADMIN' })
    .inputSchema(createUserSchema)
    .outputSchema(createUserOutputSchema)
    .action(async ({ parsedInput, ctx }): Promise<CreateUserOutput> => {
        const resetToken = randomBytes(32).toString('hex');
        const hashedToken = sha256Hex(resetToken);
        const role = parsedInput.admin ? GlobalRole.ADMIN : GlobalRole.USER;

        let user: {
            name: string | null;
            username: string;
            role: GlobalRole;
            id: string;
            password: string | null;
            resetToken: string | null;
            resetTokenExpiresAt: Date;
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
                    resetTokenExpiresAt: new Date(
                        Date.now() + 1000 * 60 * 60 * 24
                    ),
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

        const url = new URL(`${env.APP_URL}/reset-password`);
        url.searchParams.set('username', user.username);
        url.searchParams.set('reset_token', resetToken);

        return {
            username: user.username,
            role: user.role,
            resetUrl: url.toString(),
        };
    });
