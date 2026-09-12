import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listMyTenants, getTenant } from "@/lib/data/tenants";
import { getActiveTenantCookie } from "@/lib/active-tenant";
import { getEnabledFeatureKeys } from "@/lib/data/features";
import { getMyPermissions } from "@/lib/data/access";
import { getBranding } from "@/lib/data/branding";
import { buildVisibleNav } from "@/lib/nav";
import { hexToHslTriplet } from "@/lib/format";
import { AppShell } from "@/components/app/app-shell";
import { UserMenu } from "@/components/app/user-menu";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tenants = await listMyTenants();

  if (tenants.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <span className="font-semibold tracking-tight">ERP Financeiro</span>
          <UserMenu email={user.email ?? ""} />
        </header>
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md rounded-lg border p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">Vamos configurar sua empresa</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Seis perguntas rápidas para deixar o sistema pronto para o seu
              negócio.
            </p>
            <Button asChild className="mt-6 w-full" data-testid="start-onboarding-button">
              <Link href="/assistente">Começar</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cookie = await getActiveTenantCookie();
  const activeId =
    cookie && tenants.some((t) => t.id === cookie) ? cookie : tenants[0].id;

  const [active, features, perms, branding] = await Promise.all([
    getTenant(activeId),
    getEnabledFeatureKeys(activeId),
    getMyPermissions(activeId),
    getBranding(activeId),
  ]);

  try {
    await supabase.rpc("touch_member", { p_tenant: activeId });
  } catch {
    // não crítico
  }

  const nav = buildVisibleNav(features, perms);
  const activeName = active?.tradeName || active?.legalName || "Empresa";
  const triplet = branding?.accentColor
    ? hexToHslTriplet(branding.accentColor)
    : null;
  const switcherTenants = tenants.map((t) => ({
    id: t.id,
    label: t.tradeName || t.legalName,
  }));

  return (
    <AppShell
      email={user.email ?? ""}
      tenants={switcherTenants}
      activeTenantId={activeId}
      activeTenantName={activeName}
      logoUrl={null}
      brandTriplet={triplet}
      nav={nav}
    >
      {children}
    </AppShell>
  );
}
