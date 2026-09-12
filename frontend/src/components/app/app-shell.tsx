"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavGroup } from "@/lib/nav";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { CompanySwitcher, type SwitcherTenant } from "@/components/app/company-switcher";
import { UserMenu } from "@/components/app/user-menu";
import { BrandLogo } from "@/components/app/brand-logo";

export function AppShell({
  email,
  tenants,
  activeTenantId,
  activeTenantName,
  logoUrl,
  brandTriplet,
  nav,
  children,
}: {
  email: string;
  tenants: SwitcherTenant[];
  activeTenantId: string;
  activeTenantName: string;
  logoUrl: string | null;
  brandTriplet: string | null;
  nav: NavGroup[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const style = brandTriplet
    ? ({ ["--brand" as string]: brandTriplet } as React.CSSProperties)
    : undefined;

  return (
    <div className="min-h-screen bg-background" style={style}>
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background lg:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <BrandLogo
            name={activeTenantName}
            logoUrl={logoUrl}
            className="h-8 w-8"
          />
          <span className="truncate text-sm font-semibold">
            {activeTenantName}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav nav={nav} />
        </div>
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" data-testid="mobile-nav">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-r bg-background">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <BrandLogo
                  name={activeTenantName}
                  logoUrl={logoUrl}
                  className="h-8 w-8"
                />
                <span className="truncate text-sm font-semibold">
                  {activeTenantName}
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav nav={nav} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Header + main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="rounded-md p-1 hover:bg-accent lg:hidden"
              data-testid="mobile-menu-button"
            >
              <Menu className="h-5 w-5" />
            </button>
            <CompanySwitcher
              tenants={tenants}
              activeId={activeTenantId}
              logoUrl={logoUrl}
            />
          </div>
          <UserMenu email={email} />
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
