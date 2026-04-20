import { createSafeActionClient } from 'next-safe-action';
import * as z from 'zod';
import { auth } from '@/lib/auth';
import { ActionError } from '@/types/errors';
import { GlobalRole } from '@/generated/prisma/enums';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

// TODO: infer from prisma schema
const requiredRoleSchema = z.enum(['USER', 'ADMIN']).optional();
const metadataSchema = z.object({
    actionName: z.string(),
    requiredRole: requiredRoleSchema,
});
export type RequiredRole = z.infer<typeof requiredRoleSchema>;
export type ActionMetadata = z.infer<typeof metadataSchema>;

function handleServerError(err: Error): string {
    console.error(err);

    if(isRedirectError(err)) {
        throw err;
    }

    if (err instanceof ActionError) {
        return err.message;
    }

    return 'An unexpected error occurred. Please try again.';
}

export const publicActionClient = createSafeActionClient({
    handleServerError,
});

export const actionClient = createSafeActionClient({
    handleServerError,
    defineMetadataSchema: () => {
        return metadataSchema;
    },
}).use(async ({ next, metadata }) => {
    const { userId, name, username, userRole } = await checkAuth();
    checkRequiredRole(metadata, userRole);

    return next({ ctx: { userId, name, username, userRole } });
});

async function checkAuth() {
    const session = await auth();
    if (!session || !session.user) {
        throw new ActionError('User is not authenticated.');
    }

    const userId = session.user.id;
    const name = session.user.name ?? null;
    const username = session.user.username;
    const userRole = session.user.role;
    return { userId, name, username, userRole };
}

function checkRequiredRole(metadata: ActionMetadata, userRole: string) {
    if (
        metadata &&
        metadata.requiredRole &&
        !checkRole(userRole as GlobalRole, metadata.requiredRole)
    ) {
        throw new ActionError(
            `User must have ${metadata.requiredRole} role to call ${metadata.actionName}.`
        );
    }
}

function checkRole(
    userRole: GlobalRole | undefined,
    requiredRole: RequiredRole
): boolean {
    if (!userRole) return false;
    if (userRole === 'ADMIN') return true;
    return userRole === requiredRole;
}
