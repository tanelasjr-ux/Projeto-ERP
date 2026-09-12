"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroup } from "@/lib/nav";
import { navIcon } from "@/components/app/nav-icons";
import { cn } from "@/lib/utils";

export function SidebarNav({
  nav,
  onNavigate,
}: {
  nav: NavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4 px-3 py-4" data-testid="sidebar-nav">
      {nav.map((group) => (
        <div key={group.key} className="flex flex-col gap-1">
          {group.label ? (
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
          ) : null}
          {group.items.map((item) => {
            const Icon = navIcon(item.icon);
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href) && item.href !== "/em-breve";
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                data-testid={`nav-${item.key}`}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
