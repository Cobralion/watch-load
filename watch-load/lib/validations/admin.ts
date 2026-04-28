import * as z from 'zod';
import { usernameSchema } from '@/lib/validations/auth';
import { nameSchema } from '@/lib/validations/profile';

export const createUserSchema = z.object({
    name: nameSchema,
    username: usernameSchema,
    admin: z.boolean(),
});

export const createUserOutputSchema = z.object({
    username: usernameSchema,
    role: z.enum(['USER', 'ADMIN']),
    resetUrl: z.url(),
});

export type CreateUserOutput = z.infer<typeof createUserOutputSchema>;