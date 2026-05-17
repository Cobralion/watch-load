import * as z from 'zod';

const passwordPolicySchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter');

/** Existing passwords at login or change-password — policy is not re-checked client-side. */
const existingPasswordSchema = z.string().min(1, 'Password is required.');

export const usernameSchema = z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(10, { message: 'Username must not be more than 10 characters.' });

export const changePasswordSchema = z
    .object({
        currentPassword: existingPasswordSchema,
        newPassword: passwordPolicySchema,
        confirmPassword: passwordPolicySchema,
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
        message: 'New password must be different from current password.',
        path: ['newPassword'],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'New password and confirm password must match.',
        path: ['confirmPassword'],
    });

export const loginSchema = z.object({
    username: usernameSchema,
    password: existingPasswordSchema,
});

export const resetPasswordSchema = z
    .object({
        username: usernameSchema,
        resetToken: z.string(),
        password: passwordPolicySchema,
        confirmPassword: passwordPolicySchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password and confirm password must match.',
        path: ['confirmPassword'],
    });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
