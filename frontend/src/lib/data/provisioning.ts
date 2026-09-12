import { createClient } from "@/lib/supabase/server";

export type ProvisionInput = {
  legalName: string;
  businessType?: string;
  taxRegime?: string;
  sellsOnCredit?: string;
  hasInventory?: boolean;
  importBalances?: boolean;
  usersCount?: number;
  taxId?: string;
};

// Cria/configura a empresa no banco. Toda a decisão (plano de contas, features)
// é do banco — o cliente só envia as respostas.
export async function provisionTenant(
  input: ProvisionInput,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("provision_tenant", {
    p_legal_name: input.legalName,
    p_business_type: input.businessType,
    p_tax_regime: input.taxRegime,
    p_sells_on_credit: input.sellsOnCredit,
    p_has_inventory: input.hasInventory,
    p_import_balances: input.importBalances,
    p_users_count: input.usersCount,
    p_tax_id: input.taxId,
  });
  if (error) throw new Error(error.message);
  return data as string;
}
