import Link from "next/link";
import { ArrowLeft, Eye, ShieldAlert } from "lucide-react";
import { requireActiveTenant } from "@/lib/server-context";
import {
  getMyPermissions,
  getMemberPermissions,
  listMembers,
} from "@/lib/data/access";
import { getEnabledFeatureKeys } from "@/lib/data/features";
import { listPermissions } from "@/lib/data/permissions-catalog";
import { buildVisibleNav } from "@/lib/nav";
import { navIcon } from "@/components/app/nav-icons";
import { Badge } from "@/components/ui/badge";

const MODULE_LABELS: Record<string, string> = {
  empresa: "Empresa",
  financeiro: "Financeiro",
  cadastros: "Cadastros",
  contabil: "Contábil",
  comercial: "Comercial",
  estoque: "Estoque",
  relatorios: "Relatórios",
  fiscal: "Fiscal",
  gestao: "Gestão",
};

export default async function VerComoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { tenantId } = await requireActiveTenant();
  const myPerms = await getMyPermissions(tenantId);

  if (!myPerms.has("access.manage")) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="mb-3 h-8 w-8 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Sem acesso</h1>
      </div>
    );
  }

  const [memberPerms, features, allPerms, members] = await Promise.all([
    getMemberPermissions(tenantId, userId),
    getEnabledFeatureKeys(tenantId),
    listPermissions(),
    listMembers(tenantId),
  ]);

  const nav = buildVisibleNav(features, memberPerms);
  const member = members.find((m) => m.userId === userId);
  const granted = allPerms.filter((p) => memberPerms.has(p.key));

  const byModule = new Map<string, typeof granted>();
  for (const p of granted) {
    const arr = byModule.get(p.module) ?? [];
    arr.push(p);
    byModule.set(p.module, arr);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/pessoas"
        className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
        data-testid="viewas-back"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <Eye className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Vendo como {member?.email ?? "esta pessoa"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Pré-visualização somente leitura do que esta pessoa enxerga.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Menu que aparece
          </h2>
          {nav.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum item de menu disponível.
            </p>
          ) : (
            <div className="space-y-4">
              {nav.map((group) => (
                <div key={group.key}>
                  {group.label ? (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.label}
                    </p>
                  ) : null}
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = navIcon(item.icon);
                      return (
                        <li
                          key={item.key}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                          data-testid={`viewas-nav-${item.key}`}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            O que pode fazer
          </h2>
          {granted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sem permissões atribuídas.
            </p>
          ) : (
            <div className="space-y-4">
              {[...byModule.entries()].map(([mod, perms]) => (
                <div key={mod}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {MODULE_LABELS[mod] ?? mod}
                  </p>
                  <ul className="space-y-1">
                    {perms.map((p) => (
                      <li
                        key={p.key}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span>{p.label}</span>
                        {p.risk === "critico" ? (
                          <Badge variant="destructive">crítico</Badge>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
