import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { ActionError } from '@/types/errors';

export const authActionClient = createSafeActionClient({
    handleServerError: (err) => {
        console.error(err);
        if (err instanceof ActionError) {
            return err.message;
        }
        return 'An unexpected error occurred. Please try again.';
    },
});

export const actionClient = createSafeActionClient({
    handleServerError: (err) => {
        console.error(err);
        if (err instanceof ActionError) {
            return err.message;
        }

        return 'An unexpected error occurred. Please try again.';
    },
    defineMetadataSchema: () => {
        return z.object({
            actionName: z.string(),
            requiredRole: z.enum(['user', 'admin']).optional(),
        });
    },
}).use(async ({ next, metadata }) => {
    const session = await auth();
    if (!session || !session.user) {
        throw new ActionError('User is not authenticated.');
    }

    console.log(session.user);

    const userId = session.user.id;
    const name = session.user.name;
    const username = session.user.username;

    if (
        metadata &&
        metadata.requiredRole &&
        !checkRole(session.user.role, metadata.requiredRole)
    ) {
        throw new ActionError(
            `User must have ${metadata.requiredRole} role to call ${metadata.actionName}.`
        );
    }

    return next({ ctx: { userId, name, username } });
});

function checkRole(userRole: string, requiredRole: string): boolean {
    userRole = userRole.toLowerCase().trim();
    requiredRole = requiredRole.toLowerCase().trim();
    if (userRole === 'admin') {
        return true;
    }
    return userRole === requiredRole;
}
