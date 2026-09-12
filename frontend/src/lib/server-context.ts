import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyTenants } from "@/lib/data/tenants";
import { getActiveTenantCookie } from "@/lib/active-tenant";

// Resolve o usuário e a empresa ativa para páginas dentro do app.
export async function requireActiveTenant(): Promise<{
  userId: string;
  tenantId: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tenants = await listMyTenants();
  if (tenants.length === 0) redirect("/assistente");

  const cookie = await getActiveTenantCookie();
  const tenantId =
    cookie && tenants.some((t) => t.id === cookie) ? cookie : tenants[0].id;

  return { userId: user.id, tenantId };
}
