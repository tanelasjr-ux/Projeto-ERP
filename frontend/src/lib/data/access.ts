import { createClient } from "@/lib/supabase/server";

export type Member = {
  userId: string;
  email: string;
  status: string;
  lastSeenAt: string | null;
  roles: string[];
};

// Permissões do usuário atual na empresa (união das permissões dos seus papéis).
export async function getMyPermissions(
  tenantId: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  return getMemberPermissions(tenantId, user.id);
}

export async function getMemberPermissions(
  tenantId: string,
  userId: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data: roles, error } = await supabase
    .from("member_roles")
    .select("role_id")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roleIds = (roles ?? []).map((r) => r.role_id);
  if (roleIds.length === 0) return new Set();

  const { data: perms, error: e2 } = await supabase
    .from("role_permissions")
    .select("permission_key")
    .in("role_id", roleIds);
  if (e2) throw new Error(e2.message);
  return new Set((perms ?? []).map((p) => p.permission_key));
}

export async function getMemberRoleIds(
  tenantId: string,
  userId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("member_roles")
    .select("role_id")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.role_id);
}

export async function listMembers(tenantId: string): Promise<Member[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_members", {
    p_tenant: tenantId,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((m) => ({
    userId: m.user_id,
    email: m.email,
    status: m.status,
    lastSeenAt: m.last_seen_at,
    roles: m.roles ?? [],
  }));
}
