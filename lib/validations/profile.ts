import * as z from 'zod';

export const nameSchema = z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(255, { message: 'Name must not be more than 255 characters.' });

export const accountInformationSchema = z.object({
    name: nameSchema,
});

export type AccountInformationFormData = z.infer<
    typeof accountInformationSchema
>;
