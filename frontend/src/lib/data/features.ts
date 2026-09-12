import { createClient } from "@/lib/supabase/server";

// Conjunto de feature_keys habilitadas para a empresa ativa.
export async function getEnabledFeatureKeys(
  tenantId: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenant_features")
    .select("feature_key, enabled")
    .eq("tenant_id", tenantId)
    .eq("enabled", true);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.feature_key));
}
