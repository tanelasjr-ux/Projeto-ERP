"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function rpc(fn: string, args: Record<string, unknown>) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(fn as never, args as never);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/pessoas");
  return { ok: true as const, data };
}

export async function inviteMemberAction(
  tenantId: string,
  email: string,
  roleId: string,
) {
  return rpc("invite_member", {
    p_tenant: tenantId,
    p_email: email,
    p_role: roleId,
  });
}

export async function grantRoleAction(
  tenantId: string,
  userId: string,
  roleId: string,
) {
  return rpc("grant_role", {
    p_tenant: tenantId,
    p_user: userId,
    p_role: roleId,
  });
}

export async function revokeRoleAction(
  tenantId: string,
  userId: string,
  roleId: string,
) {
  return rpc("revoke_role", {
    p_tenant: tenantId,
    p_user: userId,
    p_role: roleId,
  });
}

export async function setMemberStatusAction(
  tenantId: string,
  userId: string,
  status: "active" | "suspended" | "removed",
) {
  return rpc("set_member_status", {
    p_tenant: tenantId,
    p_user: userId,
    p_status: status,
  });
}
