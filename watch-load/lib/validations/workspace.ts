import * as z from 'zod';

export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters long.')
        .max(25, 'Name must not be longer than 25 characters.'),
    description: z
        .string()
        .max(100, 'Description must not be longer than 100 characters.')
        .default(''),
    slug: z
        .string()
        .min(3, 'Slug must be at least 3 characters long.')
        .max(12, 'Slug must not be longer than 12 characters.')
        .regex(
            /^[a-z0-9-]+$/,
            'Slug must be lowercase letters, numbers, and hyphens'
        ),
});

export const manageWorkspaceSchema = z.object({
    workspaceId: z.string(),
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters long.')
        .max(25, 'Name must not be longer than 25 characters.'),
    description: z
        .string()
        .max(100, 'Description must not be longer than 100 characters.')
        .default(''),
});
