"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check, Circle, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const signupSchema = z
    .object({
        email: z.email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Include at least one uppercase letter")
            .regex(/[a-z]/, "Include at least one lowercase letter")
            .regex(/[0-9]/, "Include at least one number")
            .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignUpFormValues = z.infer<typeof signupSchema>;
type SocialProvider = "github" | "google";

function GithubIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.05.78 2.13v3.16c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4-3.09Z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
        </svg>
    );
}

function PasswordToggle({
    visible,
    onToggle,
    disabled,
}: {
    visible: boolean;
    onToggle: () => void;
    disabled?: boolean;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
            disabled={disabled}
        >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
    );
}

export function SignUpForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [socialPending, setSocialPending] = useState<SocialProvider | null>(null);

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const isPending = form.formState.isSubmitting || socialPending !== null;
    const passwordValue = form.watch("password");
    const rootError = form.formState.errors.root;

    const requirements = [
        { label: "At least 8 characters", met: passwordValue.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(passwordValue) },
        { label: "One lowercase letter", met: /[a-z]/.test(passwordValue) },
        { label: "One number", met: /[0-9]/.test(passwordValue) },
        { label: "One special character", met: /[^A-Za-z0-9]/.test(passwordValue) },
    ];

    const onSubmit = async (values: SignUpFormValues) => {
        await authClient.signUp.email(
            {
                name: values.email,
                email: values.email,
                password: values.password,
                callbackURL: "/",
            },
            {
                onSuccess: () => {
                    router.push("/");
                },
                onError: (ctx) => {
                    form.setError("root", {
                        message:
                            ctx.error.message || "Something went wrong. Please try again.",
                    });
                },
            }
        );
    };

    const onSocialSignUp = async (provider: SocialProvider) => {
        form.clearErrors("root");
        setSocialPending(provider);
        await authClient.signIn.social(
            {
                provider,
                callbackURL: "/",
            },
            {
                onError: (ctx) => {
                    setSocialPending(null);
                    form.setError("root", {
                        message:
                            ctx.error.message || "Something went wrong. Please try again.",
                    });
                },
            }
        );
    };

    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Sign up to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                        <FieldGroup>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={isPending}
                                    className="w-full"
                                    onClick={() => onSocialSignUp("github")}
                                >
                                    {socialPending === "github" ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <GithubIcon />
                                    )}
                                    GitHub
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={isPending}
                                    className="w-full"
                                    onClick={() => onSocialSignUp("google")}
                                >
                                    {socialPending === "google" ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <GoogleIcon />
                                    )}
                                    Google
                                </Button>
                            </div>

                            <FieldSeparator>Or continue with email</FieldSeparator>

                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            {...field}
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isPending}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                autoComplete="new-password"
                                                aria-invalid={fieldState.invalid}
                                                disabled={isPending}
                                                className="pr-10"
                                            />
                                            <PasswordToggle
                                                visible={showPassword}
                                                onToggle={() => setShowPassword((prev) => !prev)}
                                                disabled={isPending}
                                            />
                                        </div>
                                        <ul className="grid grid-cols-1 gap-1 pt-1 sm:grid-cols-2">
                                            {requirements.map((req) => (
                                                <li
                                                    key={req.label}
                                                    className={cn(
                                                        "flex items-center gap-1.5 text-xs transition-colors",
                                                        req.met
                                                            ? "text-emerald-600 dark:text-emerald-500"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    {req.met ? (
                                                        <Check className="size-3.5" />
                                                    ) : (
                                                        <Circle className="size-3.5" />
                                                    )}
                                                    {req.label}
                                                </li>
                                            ))}
                                        </ul>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="confirmPassword">
                                            Confirm password
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Re-enter your password"
                                                autoComplete="new-password"
                                                aria-invalid={fieldState.invalid}
                                                disabled={isPending}
                                                className="pr-10"
                                            />
                                            <PasswordToggle
                                                visible={showConfirmPassword}
                                                onToggle={() =>
                                                    setShowConfirmPassword((prev) => !prev)
                                                }
                                                disabled={isPending}
                                            />
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            {rootError && (
                                <FieldError
                                    errors={[rootError]}
                                    className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2"
                                />
                            )}

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                {form.formState.isSubmitting
                                    ? "Creating account..."
                                    : "Create Account"}
                            </Button>

                            <FieldDescription className="text-center">
                                Already have an account?{" "}
                                <Link
                                    href="/signin"
                                    className="font-medium text-primary underline underline-offset-4"
                                >
                                    Sign In
                                </Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}