import Link from "next/link";
import { requireActiveTenant } from "@/lib/server-context";
import { getMyPermissions, listMembers } from "@/lib/data/access";
import { listTenantRoles } from "@/lib/data/roles";
import { listPendingInvitations } from "@/lib/data/invitations";
import { MembersManager } from "./members-manager";
import { ShieldAlert } from "lucide-react";

export default async function PessoasPage() {
  const { userId, tenantId } = await requireActiveTenant();
  const perms = await getMyPermissions(tenantId);

  if (!perms.has("access.manage")) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="mb-3 h-8 w-8 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Sem acesso</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Você não tem permissão para gerenciar pessoas e acessos.{" "}
          <Link href="/" className="text-brand hover:underline">
            Voltar ao início
          </Link>
        </p>
      </div>
    );
  }

  const [members, roles, pendingInvitations] = await Promise.all([
    listMembers(tenantId),
    listTenantRoles(tenantId),
    listPendingInvitations(tenantId),
  ]);

  return (
    <MembersManager
      tenantId={tenantId}
      currentUserId={userId}
      members={members}
      roles={roles}
      pendingInvitations={pendingInvitations}
    />
  );
}
