import * as z from 'zod';
import { usernameSchema } from '@/lib/validations/auth';
import { nameSchema } from '@/lib/validations/profile';

export const createUserSchema = z.object({
    name: nameSchema,
    username: usernameSchema,
    admin: z.boolean(),
});