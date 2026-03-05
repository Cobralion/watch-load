import * as z from "zod";

export const loginSchema = z.object({
    username: z.string()
        .min(2, { message: "Username must be at least 2 characters." })
        .max(10, { message: "Username must not be more than 10 characters." }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters." })
        .max(50, { message: "Password must not be more than 50 characters." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;