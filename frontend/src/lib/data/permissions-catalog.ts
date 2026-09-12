import { createClient } from "@/lib/supabase/server";

export type PermissionDef = {
  key: string;
  label: string;
  description: string;
  module: string;
  risk: string;
  sortOrder: number;
};

export async function listPermissions(): Promise<PermissionDef[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("permissions")
    .select("key, label, description, module, risk, sort_order")
    .order("module")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => ({
    key: p.key,
    label: p.label,
    description: p.description,
    module: p.module,
    risk: p.risk,
    sortOrder: p.sort_order,
  }));
}
