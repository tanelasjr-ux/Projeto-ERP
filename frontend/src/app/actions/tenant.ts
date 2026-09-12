"use server";

import { cookies } from "next/headers";
import { ACTIVE_TENANT_COOKIE } from "@/lib/active-tenant";
import { listMyTenants } from "@/lib/data/tenants";

export async function setActiveTenantAction(tenantId: string) {
  const tenants = await listMyTenants();
  if (!tenants.some((t) => t.id === tenantId)) {
    return { ok: false as const, error: "Empresa inválida" };
  }
  const store = await cookies();
  store.set(ACTIVE_TENANT_COOKIE, tenantId, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
  return { ok: true as const };
}
