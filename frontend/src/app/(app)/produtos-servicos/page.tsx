import { notFound } from "next/navigation";
import { requireActiveTenant } from "@/lib/server-context";
import { getMyPermissions } from "@/lib/data/access";
import { getEnabledFeatureKeys } from "@/lib/data/features";
import { ItemsManager } from "./items-manager";

export default async function ProdutosServicosPage() {
  const { tenantId } = await requireActiveTenant();
  const [perms, features] = await Promise.all([
    getMyPermissions(tenantId),
    getEnabledFeatureKeys(tenantId),
  ]);
  // Módulo desabilitado OU sem permissão → rota inexistente (sem tela cinza).
  if (!features.has("catalog.items") || !perms.has("items.view")) notFound();

  return <ItemsManager tenantId={tenantId} canManage={perms.has("items.manage")} />;
}
