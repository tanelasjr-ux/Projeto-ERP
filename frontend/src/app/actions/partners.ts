"use server";

import { revalidatePath } from "next/cache";
import { resolveActiveTenant } from "@/lib/server-context";
import { getMyPermissions } from "@/lib/data/access";
import {
  listPartners,
  searchPartners,
  getPartner,
  createPartner,
  updatePartner,
  setPartnerActive,
  findPartnerByTaxId,
  type PartnerListParams,
  type PartnerInput,
} from "@/lib/data/partners";

function isUniqueViolation(e: unknown): boolean {
  return !!(e && typeof e === "object" && "code" in e && (e as { code: string }).code === "23505");
}

export async function fetchPartnersAction(
  params: Omit<PartnerListParams, "tenantId"> & {
    query: string;
  },
) {
  const { tenantId } = await resolveActiveTenant();
  const q = params.query.trim();
  if (q) {
    const rows = await searchPartners(tenantId, q, params.role);
    return { rows, total: rows.length, searched: true as const };
  }
  const { rows, total } = await listPartners({ ...params, tenantId });
  return { rows, total, searched: false as const };
}

export async function getPartnerAction(id: string) {
  const { tenantId } = await resolveActiveTenant();
  return getPartner(tenantId, id);
}

async function assertManage() {
  const { tenantId } = await resolveActiveTenant();
  const perms = await getMyPermissions(tenantId);
  if (!perms.has("partners.manage")) {
    return { ok: false as const, tenantId, error: "Sem permissão" };
  }
  return { ok: true as const, tenantId };
}

export async function createPartnerAction(input: PartnerInput) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    const { id } = await createPartner(guard.tenantId, input);
    revalidatePath("/clientes-fornecedores");
    return { ok: true as const, id };
  } catch (e) {
    if (isUniqueViolation(e) && input.taxId) {
      const existing = await findPartnerByTaxId(guard.tenantId, input.taxId);
      return {
        ok: false as const,
        duplicate: true as const,
        existingId: existing?.id ?? null,
        existingName: existing?.legalName ?? null,
      };
    }
    return { ok: false as const, error: "Não foi possível salvar." };
  }
}

export async function updatePartnerAction(id: string, input: PartnerInput) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    await updatePartner(guard.tenantId, id, input);
    revalidatePath("/clientes-fornecedores");
    return { ok: true as const };
  } catch (e) {
    if (isUniqueViolation(e) && input.taxId) {
      const existing = await findPartnerByTaxId(guard.tenantId, input.taxId);
      return {
        ok: false as const,
        duplicate: true as const,
        existingId: existing?.id ?? null,
        existingName: existing?.legalName ?? null,
      };
    }
    return { ok: false as const, error: "Não foi possível salvar." };
  }
}

export async function setPartnerActiveAction(id: string, active: boolean) {
  const guard = await assertManage();
  if (!guard.ok) return { ok: false as const, error: guard.error };
  try {
    await setPartnerActive(guard.tenantId, id, active);
    revalidatePath("/clientes-fornecedores");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Não foi possível alterar a situação." };
  }
}
