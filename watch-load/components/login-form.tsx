"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"
import { LoginFormData, loginSchema } from "@/lib/validations/auth"
import { useRouter } from "next/navigation"
import { login } from "@/actions/auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm<LoginFormData>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    console.log(data); // TODO: remove

    const result = await login(data);
    console.log(result); // TODO: remove

    if(result?.error)
    {
      form.setError("root", { type: "manual", message: "Invalid username or password." });
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your username and password below to login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  < FieldLabel htmlFor="form-login-username">Username</FieldLabel>
                  <Input
                  {...field}
                  id="form-login-username"
                  aria-invalid={fieldState.invalid}
                  placeholder=""
                  autoComplete="off"
                  />
                  {
                      fieldState.error &&
                      (<FieldError errors={[fieldState.error]} />)
                  }
                </Field>
              )} />

              <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  < FieldLabel htmlFor="form-login-password">Password</FieldLabel>
                  <Input
                  {...field}
                  type="password"
                  id="form-login-password"
                  aria-invalid={fieldState.invalid}
                  placeholder=""
                  autoComplete="off"
                  />
                  {
                      fieldState.error &&
                      (<FieldError errors={[fieldState.error]} />)
                  }
                </Field>
              )} />
              {form.formState.errors.root && (
                <div className="text-red-500 text-sm font-medium">
                  {form.formState.errors.root.message}
                </div>
              )}
              <Field>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

