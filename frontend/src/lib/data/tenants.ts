import { createClient } from "@/lib/supabase/server";

export type MyTenant = {
  id: string;
  slug: string;
  legalName: string;
  tradeName: string | null;
  status: string;
};

export type TenantDetail = {
  id: string;
  slug: string;
  legalName: string;
  tradeName: string | null;
  onboardingDoneAt: string | null;
  businessType: string | null;
  taxRegime: string;
};

// Empresas às quais o usuário atual pertence (RLS restringe às dele).
export async function listMyTenants(): Promise<MyTenant[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: members, error } = await supabase
    .from("tenant_members")
    .select("tenant_id, status")
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  if (!members || members.length === 0) return [];

  const ids = members.map((m) => m.tenant_id);
  const { data: tenants, error: e2 } = await supabase
    .from("tenants")
    .select("id, slug, legal_name, trade_name")
    .in("id", ids);
  if (e2) throw new Error(e2.message);

  const statusById = new Map(members.map((m) => [m.tenant_id, m.status]));
  return (tenants ?? [])
    .map((t) => ({
      id: t.id,
      slug: t.slug,
      legalName: t.legal_name,
      tradeName: t.trade_name,
      status: statusById.get(t.id) ?? "active",
    }))
    .sort((a, b) =>
      (a.tradeName ?? a.legalName).localeCompare(b.tradeName ?? b.legalName),
    );
}

export async function getTenant(tenantId: string): Promise<TenantDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select(
      "id, slug, legal_name, trade_name, onboarding_done_at, business_type, tax_regime",
    )
    .eq("id", tenantId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    legalName: data.legal_name,
    tradeName: data.trade_name,
    onboardingDoneAt: data.onboarding_done_at,
    businessType: data.business_type,
    taxRegime: data.tax_regime,
  };
}
