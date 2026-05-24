import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/(auth)/login/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth/options";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 font-heading text-base font-bold text-primary shadow-[0_0_28px_rgba(208,188,255,0.18)]">
            AS
          </div>
          <CardTitle className="text-2xl">AutoServis</CardTitle>
          <CardDescription>Sign in to manage service operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
