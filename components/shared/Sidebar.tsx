"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CarIcon,
  ClipboardListIcon,
  GaugeIcon,
  PackageIcon,
  UsersIcon,
  WrenchIcon,
  BarChart3Icon,
  SettingsIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: GaugeIcon },
  { href: "/dashboard/customers", label: "Customers", icon: UsersIcon },
  { href: "/dashboard/cars", label: "Cars", icon: CarIcon },
  { href: "/dashboard/jobs", label: "Job Orders", icon: ClipboardListIcon },
  { href: "/dashboard/masters", label: "Masters", icon: WrenchIcon },
  { href: "/dashboard/parts", label: "Parts", icon: PackageIcon },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3Icon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar/90 backdrop-blur-xl md:block">
      <div className="flex h-16 items-center border-b border-border px-4">
        <div>
          <span className="font-heading text-sm font-semibold text-sidebar-foreground">Service ERP</span>
          <div className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
            Operations
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active &&
                  "border-border bg-surface-container text-on-surface shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-16 z-20 flex gap-1 overflow-x-auto border-b border-border bg-background/88 p-2 backdrop-blur-xl md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-20 flex-col items-center justify-center gap-1 rounded-lg border border-transparent px-2 py-2 text-[11px] font-medium text-muted-foreground transition-all hover:border-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active &&
                "border-border bg-surface-container text-on-surface shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
