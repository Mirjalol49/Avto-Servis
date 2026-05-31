import { getServerSession } from "next-auth";
import Link from "next/link";
import { LanguagesIcon, PaletteIcon, ShieldIcon, UsersIcon } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth/options";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";
  const locale = getLocale();
  const dictionary = getDictionary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{dictionary.settings.title}</h1>
        <p className="text-sm text-muted-foreground">
          {dictionary.settings.description}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <ThemeSettings labels={{ ...dictionary.settings, useSystem: dictionary.common.useSystem }} />

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaletteIcon />
                {dictionary.settings.interface}
              </CardTitle>
              <CardDescription>
                {dictionary.settings.interfaceDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {dictionary.settings.interfaceBody}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LanguagesIcon />
                {dictionary.settings.languageTitle}
              </CardTitle>
              <CardDescription>
                {dictionary.settings.languageDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <LanguageSwitcher
                currentLocale={locale}
                labels={dictionary.common.languages}
                title={dictionary.common.currentLanguage}
              />
              <p className="text-sm text-muted-foreground">
                {dictionary.settings.languageBody}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon />
                {dictionary.settings.access}
              </CardTitle>
              <CardDescription>
                {dictionary.settings.accessDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isAdmin ? (
                <Link
                  href="/dashboard/settings/users"
                  className={cn(buttonVariants(), "w-fit")}
                >
                  <UsersIcon data-icon="inline-start" />
                  {dictionary.settings.manageUsers}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {dictionary.settings.nonAdminAccess}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
