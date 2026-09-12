import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

export type PartnerRow = {
  id: string;
  kind: string;
  legalName: string;
  tradeName: string | null;
  taxId: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  email: string | null;
  phone: string | null;
  isActive: boolean;
};

export type PartnerAddress = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type PartnerPaymentTerms = {
  prazo_dias: number | null;
  observacao: string;
};

export type PartnerDetail = PartnerRow & {
  address: PartnerAddress;
  paymentTerms: PartnerPaymentTerms;
  notes: string | null;
};

export type PartnerInput = {
  kind: "pf" | "pj";
  legalName: string;
  tradeName: string | null;
  taxId: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  email: string | null;
  phone: string | null;
  address: PartnerAddress;
  paymentTerms: PartnerPaymentTerms;
  notes: string | null;
  isActive: boolean;
};

const LIST_COLS =
  "id, kind, legal_name, trade_name, tax_id, is_customer, is_supplier, email, phone, is_active";
const DETAIL_COLS = `${LIST_COLS}, address, payment_terms, notes`;

const SORTABLE = new Set(["legal_name", "trade_name", "tax_id"]);

function mapRow(r: {
  id: string;
  kind: string;
  legal_name: string;
  trade_name: string | null;
  tax_id: string | null;
  is_customer: boolean;
  is_supplier: boolean;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}): PartnerRow {
  return {
    id: r.id,
    kind: r.kind,
    legalName: r.legal_name,
    tradeName: r.trade_name,
    taxId: r.tax_id,
    isCustomer: r.is_customer,
    isSupplier: r.is_supplier,
    email: r.email,
    phone: r.phone,
    isActive: r.is_active,
  };
}

export type PartnerListParams = {
  tenantId: string;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  role: "customer" | "supplier" | null;
  active: "active" | "inactive" | "all";
};

export async function listPartners(
  p: PartnerListParams,
): Promise<{ rows: PartnerRow[]; total: number }> {
  const supabase = await createClient();
  const sort = SORTABLE.has(p.sort) ? p.sort : "legal_name";
  let q = supabase
    .from("partners")
    .select(LIST_COLS, { count: "exact" })
    .eq("tenant_id", p.tenantId);
  if (p.role === "customer") q = q.eq("is_customer", true);
  if (p.role === "supplier") q = q.eq("is_supplier", true);
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

// Busca por texto SEMPRE pela função do banco (nunca .or() interpolado).
export async function searchPartners(
  tenantId: string,
  query: string,
  role: "customer" | "supplier" | null,
): Promise<PartnerRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_partners", {
    p_tenant: tenantId,
    p_query: query,
    p_role: role ?? undefined,
    p_limit: 50,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    kind: "",
    legalName: r.legal_name,
    tradeName: r.trade_name,
    taxId: r.tax_id,
    isCustomer: r.is_customer,
    isSupplier: r.is_supplier,
    email: r.email,
    phone: r.phone,
    isActive: true,
  }));
}

export async function getPartner(
  tenantId: string,
  id: string,
): Promise<PartnerDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select(DETAIL_COLS)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const addr = (data.address ?? {}) as Partial<PartnerAddress>;
  const terms = (data.payment_terms ?? {}) as Partial<PartnerPaymentTerms>;
  return {
    ...mapRow(data),
    address: {
      cep: addr.cep ?? "",
      logradouro: addr.logradouro ?? "",
      numero: addr.numero ?? "",
      complemento: addr.complemento ?? "",
      bairro: addr.bairro ?? "",
      cidade: addr.cidade ?? "",
      uf: addr.uf ?? "",
    },
    paymentTerms: {
      prazo_dias:
        typeof terms.prazo_dias === "number" ? terms.prazo_dias : null,
      observacao: terms.observacao ?? "",
    },
    notes: data.notes,
  };
}

// Para o link "ver cadastro existente" no erro de documento duplicado.
export async function findPartnerByTaxId(
  tenantId: string,
  taxId: string,
): Promise<{ id: string; legalName: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, legal_name")
    .eq("tenant_id", tenantId)
    .eq("tax_id", taxId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { id: data.id, legalName: data.legal_name };
}

function toDbPayload(tenantId: string, input: PartnerInput) {
  return {
    tenant_id: tenantId,
    kind: input.kind,
    legal_name: input.legalName,
    trade_name: input.tradeName,
    tax_id: input.taxId,
    is_customer: input.isCustomer,
    is_supplier: input.isSupplier,
    email: input.email,
    phone: input.phone,
    address: input.address as unknown as TablesInsert<"partners">["address"],
    payment_terms:
      input.paymentTerms as unknown as TablesInsert<"partners">["payment_terms"],
    notes: input.notes,
    is_active: input.isActive,
  };
}

export async function createPartner(
  tenantId: string,
  input: PartnerInput,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .insert(toDbPayload(tenantId, input) as TablesInsert<"partners">)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
}

export async function updatePartner(
  tenantId: string,
  id: string,
  input: PartnerInput,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("partners")
    .update(toDbPayload(tenantId, input) as TablesUpdate<"partners">)
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) throw error;
}

export async function setPartnerActive(
  tenantId: string,
  id: string,
  active: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("partners")
    .update({ is_active: active })
    .eq("tenant_id", tenantId)
    .eq("id", id);
  if (error) throw error;
}
