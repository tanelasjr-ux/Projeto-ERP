"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { setActiveTenantAction } from "@/app/actions/tenant";
import { BrandLogo } from "@/components/app/brand-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type SwitcherTenant = {
  id: string;
  label: string;
};

export function CompanySwitcher({
  tenants,
  activeId,
  logoUrl,
}: {
  tenants: SwitcherTenant[];
  activeId: string;
  logoUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active = tenants.find((t) => t.id === activeId) ?? tenants[0];

  function select(id: string) {
    if (id === activeId) return;
    startTransition(async () => {
      await setActiveTenantAction(id);
      router.refresh();
    });
  }

  if (tenants.length <= 1) {
    return (
      <div
        className="flex items-center gap-2"
        data-testid="company-static"
      >
        <BrandLogo name={active.label} logoUrl={logoUrl} className="h-8 w-8" />
        <span className="max-w-[180px] truncate text-sm font-semibold">
          {active.label}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors hover:bg-accent",
          pending && "opacity-60",
        )}
        data-testid="company-switcher-trigger"
      >
        <BrandLogo name={active.label} logoUrl={logoUrl} className="h-7 w-7" />
        <span className="max-w-[160px] truncate font-semibold">
          {active.label}
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Trocar de empresa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => select(t.id)}
            data-testid={`company-option-${t.id}`}
          >
            <span className="flex-1 truncate">{t.label}</span>
            {t.id === activeId ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
