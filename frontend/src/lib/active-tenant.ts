import { cookies } from "next/headers";

export const ACTIVE_TENANT_COOKIE = "active_tenant";

export async function getActiveTenantCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_TENANT_COOKIE)?.value ?? null;
}
