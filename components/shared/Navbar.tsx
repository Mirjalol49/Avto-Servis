import { getServerSession } from "next-auth";

import { SignOutButton } from "@/components/shared/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth/options";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="font-heading text-base font-semibold">AutoServis</div>
      {session?.user ? (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium">{session.user.name}</div>
            <div className="text-xs text-muted-foreground">{session.user.email}</div>
          </div>
          <Badge variant="secondary">{session.user.role}</Badge>
          <SignOutButton />
        </div>
      ) : null}
    </header>
  );
}
