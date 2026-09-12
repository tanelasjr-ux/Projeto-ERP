import { notFound } from "next/navigation";
import { requireActiveTenant } from "@/lib/server-context";
import { getMyPermissions } from "@/lib/data/access";
import { PartnersManager } from "./partners-manager";

export default async function ClientesFornecedoresPage() {
  const { tenantId } = await requireActiveTenant();
  const perms = await getMyPermissions(tenantId);
  if (!perms.has("partners.view")) notFound();

  return (
    <PartnersManager tenantId={tenantId} canManage={perms.has("partners.manage")} />
  );
}
