"use server";
import AuthState from "@/types/auth-state";
import { LoginFormData, loginSchema } from "@/lib/validations/auth";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";



export async function login(formData: LoginFormData): Promise<AuthState> {
    try {
        const validation = await loginSchema.safeParseAsync(formData);
        if(!validation.success) {
            throw new Error("Invalid form data.");
        }
        const { username, password } = validation.data;

        const result = await signIn("credentials", {username, password, redirect: false});
        console.log("Auth signIn result: {}", result)

        return {
            success: true
        };
    } catch (error) {
        console.error("e", error);

        if(error instanceof AuthError) {
            switch(error.type) {
                case "CredentialsSignin":
                    return {
                        success: false,
                        error: "Invalid username or password."
                    };
                default:
                    return {
                        success: false,
                        error: "An unknown authentication error occurred."
                    };
            }
        }

        throw error;
    }
}