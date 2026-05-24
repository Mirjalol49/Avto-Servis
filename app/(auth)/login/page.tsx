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
      <Card className="w-full max-w-md border-white/10">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-heading text-base font-bold text-slate-200 shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
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
