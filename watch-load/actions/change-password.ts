'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    ChangePasswordFormData,
    changePasswordSchema,
} from '@/lib/validations/auth';
import { ChangePasswordState } from '@/types/form-states';
import bcrypt from 'bcryptjs';

export default async function changePassword(
    formData: ChangePasswordFormData
): Promise<ChangePasswordState> {
    const validation = await changePasswordSchema.safeParseAsync(formData);
    if (!validation.success) {
        return { success: false, error: 'Invalid form data.' };
    }

    const { currentPassword, newPassword } = validation.data;

    const session = await auth();
    if (!session?.user?.username) {
        return { success: false, error: 'User is not authenticated.' };
    }
    const user = await prisma.user.findUnique({
        where: { username: session.user.username },
        select: { id: true, password: true },
    });

    if (!user) {
        return { success: false, error: "User doesn't exist." };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        return { success: false, error: 'Current password is incorrect.' };
    }

    try {
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: newPasswordHash },
        });
    } catch {
        return {
            success: false,
            error: 'Failed to update password. Please try again.',
        };
    }

    return { success: true };
}
