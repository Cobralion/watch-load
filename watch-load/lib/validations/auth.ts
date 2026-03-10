import * as z from 'zod';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter');

export const changePasswordSchema = z
  .object({
    currentPassword: passwordValidation,
    newPassword: passwordValidation,
    confirmPassword: passwordValidation,
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
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(10, { message: 'Username must not be more than 10 characters.' }),
  password: passwordValidation,
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
