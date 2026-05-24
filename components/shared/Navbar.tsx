import { getServerSession } from "next-auth";

import { SignOutButton } from "@/components/shared/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { authOptions } from "@/lib/auth/options";
export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface-container font-heading text-sm font-bold text-on-surface shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
          AS
        </div>
        <div>
          <div className="font-heading text-base font-semibold leading-tight">AutoServis</div>
          <div className="hidden font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground sm:block">
            Service Command
          </div>
        </div>
      </div>
      {session?.user ? (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-tight">{session.user.name}</div>
            <div className="font-mono text-[11px] text-muted-foreground">{session.user.email}</div>
          </div>
          <Badge variant="secondary" className="border-border bg-surface-container text-on-surface-variant">
            {session.user.role}
          </Badge>
          <ThemeToggle />
          <SignOutButton />
        </div>
      ) : null}
    </header>
  );
}
