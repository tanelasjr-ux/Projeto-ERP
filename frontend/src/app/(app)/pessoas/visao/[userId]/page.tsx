import Link from "next/link";
import { ArrowLeft, Eye, ShieldAlert, Info } from "lucide-react";
import { requireActiveTenant } from "@/lib/server-context";
import {
  getMyPermissions,
  listMemberPermissionDetails,
  listMembers,
  type MemberPermissionDetail,
} from "@/lib/data/access";
import { getEnabledFeatureKeys } from "@/lib/data/features";
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

const isHighlighted = (risk: string) =>
  risk === "sensivel" || risk === "critico";

function riskBadge(risk: string) {
  if (risk === "critico") return <Badge variant="destructive">crítico</Badge>;
  if (risk === "sensivel") return <Badge variant="warning">sensível</Badge>;
  return null;
}

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

  const [memberPerms, features, members] = await Promise.all([
    listMemberPermissionDetails(tenantId, userId),
    getEnabledFeatureKeys(tenantId),
    listMembers(tenantId),
  ]);

  const member = members.find((m) => m.userId === userId);
  const personLabel = member?.email ?? "esta pessoa";

  // Menu derivado exatamente como o menu real: features da empresa × permissões.
  const permKeys = new Set(memberPerms.map((p) => p.permissionKey));
  const nav = buildVisibleNav(features, permKeys);

  // Agrupa por módulo, respeitando a ordem do catálogo (module, sort_order).
  const sorted = [...memberPerms].sort(
    (a, b) => a.module.localeCompare(b.module) || a.sortOrder - b.sortOrder,
  );
  const byModule = new Map<string, MemberPermissionDetail[]>();
  for (const p of sorted) {
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
            Vendo como {personLabel}
          </h1>
          <p className="text-sm text-muted-foreground">
            Pré-visualização somente leitura do que esta pessoa enxerga.
          </p>
        </div>
      </div>

      {/* Deixa inequívoco de quem é cada menu (a barra lateral é do auditor). */}
      <div
        className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        data-testid="viewas-disclaimer"
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          A barra lateral à esquerda é o <strong>seu</strong> menu e continua
          funcionando normalmente. Os quadros abaixo mostram apenas o que{" "}
          <strong>{personLabel}</strong> vê — nada aqui altera os seus acessos
          nem os desta pessoa.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Menu da pessoa: emoldurado como uma "janela" para não se confundir
            com a barra lateral real do auditor. */}
        <section
          className="overflow-hidden rounded-lg border"
          data-testid="viewas-menu-panel"
        >
          <div className="flex items-center gap-2 border-b bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            Menu de {personLabel} — como esta pessoa navega
          </div>
          <div className="p-5">
            {nav.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum item de menu disponível para esta pessoa.
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
          </div>
        </section>

        <section
          className="rounded-lg border p-5"
          data-testid="viewas-permissions-panel"
        >
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            O que {personLabel} pode fazer
          </h2>
          {memberPerms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sem permissões atribuídas.
            </p>
          ) : (
            <div className="space-y-5">
              {[...byModule.entries()].map(([mod, perms]) => {
                const normais = perms.filter((p) => !isHighlighted(p.risk));
                const destaque = perms.filter((p) => isHighlighted(p.risk));
                return (
                  <div key={mod} data-testid={`viewas-module-${mod}`}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {MODULE_LABELS[mod] ?? mod}
                    </p>

                    {normais.length > 0 && (
                      <ul className="space-y-1">
                        {normais.map((p) => (
                          <li
                            key={p.permissionKey}
                            className="text-sm"
                            data-testid={`viewas-perm-${p.permissionKey}`}
                          >
                            {p.label}
                          </li>
                        ))}
                      </ul>
                    )}

                    {destaque.length > 0 && (
                      <div className="mt-2 rounded-md border border-dashed bg-muted/40 p-2.5">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Ações sensíveis
                        </p>
                        <ul className="space-y-1.5">
                          {destaque.map((p) => (
                            <li
                              key={p.permissionKey}
                              className="flex items-center justify-between gap-2 text-sm"
                              data-testid={`viewas-perm-${p.permissionKey}`}
                            >
                              <span>{p.label}</span>
                              {riskBadge(p.risk)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
