"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, LockKeyholeIcon, PhoneIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";

type LoginFormLabels = {
  phone: string;
  password: string;
  invalidCredentials: string;
  signingIn: string;
  signIn: string;
};

export function LoginForm({ labels }: { labels: LoginFormLabels }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    setError(null);

    const result = await signIn("credentials", {
      phone: values.phone,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      setError(labels.invalidCredentials);
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(form.formState.errors.phone)}>
          <FieldLabel htmlFor="phone" className="text-sm font-medium">
            {labels.phone}
          </FieldLabel>
          <div
            className={cn(
              "flex h-11 items-center rounded-xl border border-input bg-background px-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15",
              form.formState.errors.phone &&
                "border-destructive ring-3 ring-destructive/20"
            )}
          >
            <PhoneIcon className="mr-2 size-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="937489141"
              aria-invalid={Boolean(form.formState.errors.phone)}
              className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
              {...form.register("phone")}
            />
          </div>
          <FieldError errors={[form.formState.errors.phone]} />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <FieldLabel htmlFor="password" className="text-sm font-medium">
            {labels.password}
          </FieldLabel>
          <div
            className={cn(
              "flex h-11 items-center rounded-xl border border-input bg-background px-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15",
              form.formState.errors.password &&
                "border-destructive ring-3 ring-destructive/20"
            )}
          >
            <LockKeyholeIcon className="mr-2 size-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(form.formState.errors.password)}
              className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
              {...form.register("password")}
            />
          </div>
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="mt-2 h-11 w-full rounded-xl font-semibold"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2Icon data-icon="inline-start" className="animate-spin" />
          ) : null}
          {form.formState.isSubmitting ? labels.signingIn : labels.signIn}
        </Button>
      </FieldGroup>
    </form>
  );
}
