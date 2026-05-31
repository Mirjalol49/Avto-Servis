import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  BadgeCheckIcon,
  ClipboardListIcon,
  GaugeIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { LoginForm } from "@/app/(auth)/login/LoginForm";
import { authOptions } from "@/lib/auth/options";
import { getDictionary } from "@/lib/i18n/server";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  const dictionary = getDictionary();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_560px]">
        <section className="relative hidden overflow-hidden border-r border-border bg-surface-container-lowest lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--primary)/0.10),transparent_34%),radial-gradient(circle_at_20%_20%,rgb(var(--secondary)/0.10),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-card font-heading text-sm font-bold text-primary shadow-sm">
                AS
              </div>
              <div>
                <div className="font-heading text-lg font-semibold">
                  {dictionary.common.appName}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.05em] text-muted-foreground">
                  {dictionary.common.serviceCommand}
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                <ShieldCheckIcon className="size-4 text-primary" />
                Staff terminal
              </div>
              <h1 className="font-heading text-5xl font-bold leading-tight tracking-normal text-foreground">
                Reception desk for active service operations.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                Authorized staff can continue to the current workshop queue.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Queue", value: "Live", icon: ClipboardListIcon },
                { label: "Inventory", value: "Ready", icon: GaugeIcon },
                { label: "Access", value: "Secured", icon: BadgeCheckIcon },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur"
                  >
                    <Icon className="mb-4 size-5 text-primary" />
                    <div className="font-heading text-xl font-semibold">
                      {item.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-[420px]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_24px_80px_rgb(0_0_0/0.12)] sm:p-7">
              <div className="mb-7">
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-muted font-heading text-sm font-bold text-primary">
                  AS
                </div>
                <h1 className="font-heading text-3xl font-semibold tracking-normal">
                  {dictionary.common.appName}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {dictionary.auth.signInSubtitle}
                </p>
              </div>
              <LoginForm labels={dictionary.auth} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
