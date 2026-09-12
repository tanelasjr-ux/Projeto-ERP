import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

export type ItemRow = {
  id: string;
  kind: string;
  code: string | null;
  name: string;
  unit: string;
  salePrice: number | null;
  costPrice: number | null;
  isActive: boolean;
};

export type ItemDetail = ItemRow & { notes: string | null };

export type ItemInput = {
  kind: "produto" | "servico";
  code: string | null;
  name: string;
  unit: string;
  salePrice: number | null;
  costPrice: number | null;
  notes: string | null;
  isActive: boolean;
};

const LIST_COLS =
  "id, kind, code, name, unit, sale_price, cost_price, is_active";
const DETAIL_COLS = `${LIST_COLS}, notes`;
const SORTABLE = new Set(["name", "code", "sale_price"]);

function mapRow(r: {
  id: string;
  kind: string;
  code: string | null;
  name: string;
  unit: string;
  sale_price: number | null;
  cost_price: number | null;
  is_active: boolean;
}): ItemRow {
  return {
    id: r.id,
    kind: r.kind,
    code: r.code,
    name: r.name,
    unit: r.unit,
    salePrice: r.sale_price,
    costPrice: r.cost_price,
    isActive: r.is_active,
  };
}

export type ItemListParams = {
  tenantId: string;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  query: string;
  kind: "produto" | "servico" | null;
  active: "active" | "inactive" | "all";
};

export async function listItems(
  p: ItemListParams,
): Promise<{ rows: ItemRow[]; total: number }> {
  const supabase = await createClient();
  const sort = SORTABLE.has(p.sort) ? p.sort : "name";
  let q = supabase
    .from("items")
    .select(LIST_COLS, { count: "exact" })
    .eq("tenant_id", p.tenantId);
  if (p.kind) q = q.eq("kind", p.kind);
  if (p.active === "active") q = q.eq("is_active", true);
  if (p.active === "inactive") q = q.eq("is_active", false);
  // Filtro parametrizado por coluna (não é .or() interpolado).
  if (p.query.trim()) q = q.ilike("name", `%${p.query.trim()}%`);
  const from = (p.page - 1) * p.pageSize;
  q = q
    .order(sort, { ascending: p.dir === "asc" })
    .range(from, from + p.pageSize - 1);
  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []).map(mapRow), total: count ?? 0 };
}

export async function getItem(
  tenantId: string,
  id: string,
): Promise<ItemDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select(DETAIL_COLS)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...mapRow(data), notes: data.notes };
}

export async function findItemByCode(
  tenantId: string,
  code: string,
): Promise<{ id: string; name: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { id: data.id, name: data.name };
}

function toDbPayload(tenantId: string, input: ItemInput) {
  return {
    tenant_id: tenantId,
    kind: input.kind,
    // code vazio grava null, nunca "" (senão colide na segunda gravação).
    code: input.code && input.code.trim() ? input.code.trim() : null,
    name: input.name,
    unit: input.unit && input.unit.trim() ? input.unit.trim() : "un",
    sale_price: input.salePrice,
    cost_price: input.costPrice,
    notes: input.notes,
    is_active: input.isActive,
  };
}

export async function createItem(
  tenantId: string,
  input: ItemInput,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .insert(toDbPayload(tenantId, input) as TablesInsert<"items">)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
}

export async function updateItem(
  tenantId: string,
  id: string,
  input: ItemInput,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("items")
    .update(toDbPayload(tenantId, input) as TablesUpdate<"items">)
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) throw error;
}

export async function setItemActive(
  tenantId: string,
  id: string,
  active: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("items")
    .update({ is_active: active })
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) throw error;
}
