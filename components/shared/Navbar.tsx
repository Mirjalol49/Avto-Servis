import { getServerSession } from "next-auth";

import { SignOutButton } from "@/components/shared/SignOutButton";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth/options";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 font-heading text-sm font-bold text-primary shadow-[0_0_28px_rgba(208,188,255,0.18)]">
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
          <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
            {session.user.role}
          </Badge>
          <SignOutButton />
        </div>
      ) : null}
    </header>
  );
}
