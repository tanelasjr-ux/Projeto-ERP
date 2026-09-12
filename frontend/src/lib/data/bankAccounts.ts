import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

export type BankAccountRow = {
  id: string;
  name: string;
  kind: string;
  bankCode: string | null;
  branch: string | null;
  number: string | null;
  openingBalance: number;
  isActive: boolean;
  accountId: string;
};

export type BankAccountInput = {
  name: string;
  kind: string;
  bankCode: string | null;
  branch: string | null;
  number: string | null;
  openingBalance: number;
  accountId: string;
  isActive: boolean;
};

export type PostableAccount = { id: string; code: string; name: string };

const LIST_COLS =
  "id, name, kind, bank_code, branch, number, opening_balance, is_active, account_id";
const SORTABLE = new Set(["name", "kind"]);

function mapRow(r: {
  id: string;
  name: string;
  kind: string;
  bank_code: string | null;
  branch: string | null;
  number: string | null;
  opening_balance: number;
  is_active: boolean;
  account_id: string;
}): BankAccountRow {
  return {
    id: r.id,
    name: r.name,
    kind: r.kind,
    bankCode: r.bank_code,
    branch: r.branch,
    number: r.number,
    openingBalance: r.opening_balance,
    isActive: r.is_active,
    accountId: r.account_id,
  };
}

export type BankListParams = {
  tenantId: string;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  active: "active" | "inactive" | "all";
};

export async function listBankAccounts(
  p: BankListParams,
): Promise<{ rows: BankAccountRow[]; total: number }> {
  const supabase = await createClient();
  const sort = SORTABLE.has(p.sort) ? p.sort : "name";
  let q = supabase
    .from("bank_accounts")
    .select(LIST_COLS, { count: "exact" })
    .eq("tenant_id", p.tenantId);
  if (p.active === "active") q = q.eq("is_active", true);
  if (p.active === "inactive") q = q.eq("is_active", false);
  const from = (p.page - 1) * p.pageSize;
  q = q
    .order(sort, { ascending: p.dir === "asc" })
    .range(from, from + p.pageSize - 1);
  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []).map(mapRow), total: count ?? 0 };
}

export async function getBankAccount(
  tenantId: string,
  id: string,
): Promise<BankAccountRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(LIST_COLS)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data);
}

export async function findBankAccountByName(
  tenantId: string,
  name: string,
): Promise<{ id: string; name: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("name", name)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { id: data.id, name: data.name };
}

// Contas analíticas do ativo (para amarrar a conta bancária ao razão).
export async function listPostableAssetAccounts(
  tenantId: string,
): Promise<PostableAccount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, code, name")
    .eq("tenant_id", tenantId)
    .eq("is_postable", true)
    .eq("kind", "asset")
    .order("code");
  if (error) throw new Error(error.message);
  return (data ?? []).map((a) => ({ id: a.id, code: a.code, name: a.name }));
}

function toDbPayload(tenantId: string, input: BankAccountInput) {
  return {
    tenant_id: tenantId,
    name: input.name,
    kind: input.kind,
    bank_code: input.bankCode,
    branch: input.branch,
    number: input.number,
    opening_balance: input.openingBalance,
    account_id: input.accountId,
    is_active: input.isActive,
  };
}

export async function createBankAccount(
  tenantId: string,
  input: BankAccountInput,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .insert(toDbPayload(tenantId, input) as TablesInsert<"bank_accounts">)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
}

export async function updateBankAccount(
  tenantId: string,
  id: string,
  input: BankAccountInput,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bank_accounts")
    .update(toDbPayload(tenantId, input) as TablesUpdate<"bank_accounts">)
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) throw error;
}

export async function setBankAccountActive(
  tenantId: string,
  id: string,
  active: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bank_accounts")
    .update({ is_active: active })
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) throw error;
}
