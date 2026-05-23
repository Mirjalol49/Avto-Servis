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
] as const;

function isActiveRoute(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-heading text-sm font-semibold">Service ERP</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground"
              )}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
