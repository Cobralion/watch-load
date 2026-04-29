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

export const toggleGlobalAdminSchema = z.object({
    userId: z.string(),
    isAdmin: z.boolean(),
});

export const removeGlobalUserSchema = z.object({
    userId: z.string(),
});

export const generatePasswordResetLinkSchema = z.object({
    userId: z.string(),
});

export const generatePasswordResetLinkOutputSchema = z.object({
    username: usernameSchema,
    resetUrl: z.url(),
});

export type GeneratePasswordResetLinkOutput = z.infer<
    typeof generatePasswordResetLinkOutputSchema
>;
