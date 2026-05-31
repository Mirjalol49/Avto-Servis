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
import { getDictionary } from "@/lib/i18n/server";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  const dictionary = getDictionary();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-lg border border-border bg-muted font-heading text-base font-bold text-primary shadow-sm">
            AS
          </div>
          <CardTitle className="text-2xl">{dictionary.common.appName}</CardTitle>
          <CardDescription>{dictionary.auth.signInSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm labels={dictionary.auth} />
        </CardContent>
      </Card>
    </main>
  );
}
