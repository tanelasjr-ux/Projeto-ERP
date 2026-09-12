"use server";

import { revalidatePath } from "next/cache";
import { resolveActiveTenant } from "@/lib/server-context";
import { getMyPermissions } from "@/lib/data/access";
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  setItemActive,
  findItemByCode,
  type ItemListParams,
  type ItemInput,
} from "@/lib/data/items";

function isUniqueViolation(e: unknown): boolean {
  return !!(e && typeof e === "object" && "code" in e && (e as { code: string }).code === "23505");
}

export async function fetchItemsAction(
  params: Omit<ItemListParams, "tenantId">,
) {
  const { tenantId } = await resolveActiveTenant();
  return listItems({ ...params, tenantId });
}

export async function getItemAction(id: string) {
  const { tenantId } = await resolveActiveTenant();
  return getItem(tenantId, id);
}

async function assertManage() {
  const { tenantId } = await resolveActiveTenant();
  const perms = await getMyPermissions(tenantId);
  if (!perms.has("items.manage")) {
    return { ok: false as const, tenantId, error: "Sem permissão" };
  }
  return { ok: true as const, tenantId };
}

async function duplicatePayload(tenantId: string, code: string | null) {
  if (!code || !code.trim()) return null;
  const existing = await findItemByCode(tenantId, code.trim());
  return {
    ok: false as const,
    duplicate: true as const,
    existingId: existing?.id ?? null,
    existingName: existing?.name ?? null,
  };
}

export async function createItemAction(input: ItemInput) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    const { id } = await createItem(guard.tenantId, input);
    revalidatePath("/produtos-servicos");
    return { ok: true as const, id };
  } catch (e) {
    if (isUniqueViolation(e)) {
      const dup = await duplicatePayload(guard.tenantId, input.code);
      if (dup) return dup;
    }
    return { ok: false as const, error: "Não foi possível salvar." };
  }
}

export async function updateItemAction(id: string, input: ItemInput) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    await updateItem(guard.tenantId, id, input);
    revalidatePath("/produtos-servicos");
    return { ok: true as const };
  } catch (e) {
    if (isUniqueViolation(e)) {
      const dup = await duplicatePayload(guard.tenantId, input.code);
      if (dup) return dup;
    }
    return { ok: false as const, error: "Não foi possível salvar." };
  }
}

export async function setItemActiveAction(id: string, active: boolean) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    await setItemActive(guard.tenantId, id, active);
    revalidatePath("/produtos-servicos");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Não foi possível alterar a situação." };
  }
}
