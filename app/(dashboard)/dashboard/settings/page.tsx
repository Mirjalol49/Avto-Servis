import { getServerSession } from "next-auth";
import Link from "next/link";
import { PaletteIcon, ShieldIcon, UsersIcon } from "lucide-react";

import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth/options";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage appearance, access, and workspace preferences.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <ThemeSettings />

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaletteIcon />
                Interface
              </CardTitle>
              <CardDescription>
                Theme choices are saved in this browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Light mode uses the Indigo Insight Update palette. Dark mode uses
              the original Indigo Insight palette.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon />
                Access
              </CardTitle>
              <CardDescription>
                Admin-only user management stays under Settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isAdmin ? (
                <Link
                  href="/dashboard/settings/users"
                  className={cn(buttonVariants(), "w-fit")}
                >
                  <UsersIcon data-icon="inline-start" />
                  Manage users
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ask an admin to create, edit, or review user accounts.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
