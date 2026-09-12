"use server";

import { revalidatePath } from "next/cache";
import { resolveActiveTenant } from "@/lib/server-context";
import { getMyPermissions } from "@/lib/data/access";
import {
  listBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  setBankAccountActive,
  findBankAccountByName,
  listPostableAssetAccounts,
  type BankListParams,
  type BankAccountInput,
} from "@/lib/data/bankAccounts";

function isUniqueViolation(e: unknown): boolean {
  return !!(e && typeof e === "object" && "code" in e && (e as { code: string }).code === "23505");
}

export async function fetchBankAccountsAction(
  params: Omit<BankListParams, "tenantId">,
) {
  const { tenantId } = await resolveActiveTenant();
  return listBankAccounts({ ...params, tenantId });
}

export async function getBankAccountAction(id: string) {
  const { tenantId } = await resolveActiveTenant();
  return getBankAccount(tenantId, id);
}

export async function fetchPostableAssetAccountsAction() {
  const { tenantId } = await resolveActiveTenant();
  return listPostableAssetAccounts(tenantId);
}

async function assertManage() {
  const { tenantId } = await resolveActiveTenant();
  const perms = await getMyPermissions(tenantId);
  if (!perms.has("bank.manage")) {
    return { ok: false as const, tenantId, error: "Sem permissão" };
  }
  return { ok: true as const, tenantId };
}

async function duplicatePayload(tenantId: string, name: string) {
  const existing = await findBankAccountByName(tenantId, name);
  return {
    ok: false as const,
    duplicate: true as const,
    existingName: existing?.name ?? name,
  };
}

export async function createBankAccountAction(input: BankAccountInput) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    const { id } = await createBankAccount(guard.tenantId, input);
    revalidatePath("/contas-bancarias");
    return { ok: true as const, id };
  } catch (e) {
    if (isUniqueViolation(e)) return duplicatePayload(guard.tenantId, input.name);
    return { ok: false as const, error: "Não foi possível salvar." };
  }
}

export async function updateBankAccountAction(
  id: string,
  input: BankAccountInput,
) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    await updateBankAccount(guard.tenantId, id, input);
    revalidatePath("/contas-bancarias");
    return { ok: true as const };
  } catch (e) {
    if (isUniqueViolation(e)) return duplicatePayload(guard.tenantId, input.name);
    return { ok: false as const, error: "Não foi possível salvar." };
  }
}

export async function setBankAccountActiveAction(id: string, active: boolean) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    await setBankAccountActive(guard.tenantId, id, active);
    revalidatePath("/contas-bancarias");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Não foi possível alterar a situação." };
  }
}
