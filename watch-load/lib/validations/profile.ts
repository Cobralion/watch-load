import * as z from 'zod';

export const accountInformationSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Name must be at least 2 characters.' })
        .max(255, { message: 'Name must not be more than 255 characters.' }),
});

export type AccountInformationFormData = z.infer<
    typeof accountInformationSchema
>;
