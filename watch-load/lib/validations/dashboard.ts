import * as z from 'zod';

export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters long.')
        .max(25, 'Name must not be longer than 25 characters.'),
    description: z
        .string()
        .max(100, 'Name must not be longer than 100 characters.')
        .optional(),
    slug: z
        .string()
        .min(3, 'Name must be at least 3 characters long.')
        .max(12, 'Name must not be longer than 12 characters.')
        .regex(
            /^[a-z0-9-]+$/,
            'Slug must be lowercase letters, numbers, and hyphens'
        ),
});

export const manageWorkspaceSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters long.')
        .max(25, 'Name must not be longer than 25 characters.'),
    description: z
        .string()
        .max(100, 'Name must not be longer than 100 characters.')
        .optional(),
});
