'use server';

import { actionClient } from '@/lib/safe-action';
import { createUserSchema } from '@/lib/validations/admin';
import { prisma } from '@/lib/prisma';
import { GlobalRole } from '@/generated/prisma/enums';

export const createUser = actionClient
.metadata({actionName: 'createUser', requiredRole: 'ADMIN'})
.inputSchema(createUserSchema)
.action(async ({ parsedInput, ctx }) => {

    const crypto
    const user = await prisma.user.create({
        data: {
            username: parsedInput.username,
            password: '',
            name: parsedInput.name,
            role: parsedInput.admin ? GlobalRole.ADMIN : GlobalRole.USER,
        },
    });
});