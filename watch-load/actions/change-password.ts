'use server';

import { prisma } from '@/lib/prisma';
import { changePasswordSchema } from '@/lib/validations/auth';
import bcrypt from 'bcryptjs';
import { actionClient } from '@/lib/safe-action';
import { ActionError } from '@/types/errors';

export const changePassword = actionClient
    .metadata({ actionName: 'changePassword' })
    .inputSchema(changePasswordSchema)
    .action(async ({ parsedInput, ctx }): Promise<void> => {
        const { currentPassword, newPassword } = parsedInput;
        const user = await prisma.user.findUnique({
            where: { id: ctx.userId },
            select: { password: true },
        });

        if (!user) {
            throw new ActionError("User doesn't exist.");
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new ActionError('Current password is incorrect.');
        }

        try {
            const newPasswordHash = await bcrypt.hash(newPassword, 12);

            await prisma.user.update({
                where: { id: ctx.userId },
                data: { password: newPasswordHash },
            });
        } catch {
            throw new ActionError(
                'Failed to update to new password. Please try again.'
            );
        }
    });
