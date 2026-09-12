import { notFound } from "next/navigation";
import { requireActiveTenant } from "@/lib/server-context";
import { getMyPermissions } from "@/lib/data/access";
import { getEnabledFeatureKeys } from "@/lib/data/features";
import { BankAccountsManager } from "./bank-accounts-manager";

export default async function ContasBancariasPage() {
  const { tenantId } = await requireActiveTenant();
  const [perms, features] = await Promise.all([
    getMyPermissions(tenantId),
    getEnabledFeatureKeys(tenantId),
  ]);
  if (!features.has("financial.bank") || !perms.has("bank.view")) notFound();

  return (
    <BankAccountsManager tenantId={tenantId} canManage={perms.has("bank.manage")} />
  );
}
