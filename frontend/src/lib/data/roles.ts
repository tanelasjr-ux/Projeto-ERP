import { createClient } from "@/lib/supabase/server";

export type TenantRole = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

// Papéis (modelos) da empresa ativa — cada empresa tem suas próprias cópias.
export async function listTenantRoles(
  tenantId: string,
): Promise<TenantRole[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .select("id, key, name, description")
    .eq("tenant_id", tenantId)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    description: r.description,
  }));
}
