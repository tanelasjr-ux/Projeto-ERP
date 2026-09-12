"use server";

import { cookies } from "next/headers";
import { ACTIVE_TENANT_COOKIE } from "@/lib/active-tenant";
import { provisionTenant, type ProvisionInput } from "@/lib/data/provisioning";

export async function provisionAction(input: ProvisionInput) {
  try {
    const tenantId = await provisionTenant(input);
    const store = await cookies();
    store.set(ACTIVE_TENANT_COOKIE, tenantId, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
    return { ok: true as const, tenantId };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Falha ao configurar a empresa",
    };
  }
}
