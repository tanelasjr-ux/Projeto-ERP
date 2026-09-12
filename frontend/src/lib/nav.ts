// Registro de navegação. O menu é montado dinamicamente cruzando as features
// habilitadas da empresa (tenant_features) com as permissões do usuário.
// Itens são serializáveis (ícone é uma string mapeada no cliente).

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: string;
  featureKey: string | null; // null = não depende de módulo
  permissionKey: string | null; // null = não depende de permissão
  implemented: boolean;
};

export type NavGroup = {
  key: string;
  label: string;
  items: NavItem[];
};

const REGISTRY: NavGroup[] = [
  {
    key: "principal",
    label: "",
    items: [
      {
        key: "inicio",
        label: "Início",
        href: "/",
        icon: "home",
        featureKey: null,
        permissionKey: null,
        implemented: true,
      },
    ],
  },
  {
    key: "financeiro",
    label: "Financeiro",
    items: [
      {
        key: "ap",
        label: "Contas a pagar",
        href: "/em-breve",
        icon: "arrow-up-circle",
        featureKey: "financial.payables",
        permissionKey: "ap.view",
        implemented: false,
      },
      {
        key: "ar",
        label: "Contas a receber",
        href: "/em-breve",
        icon: "arrow-down-circle",
        featureKey: "financial.receivables",
        permissionKey: "ar.view",
        implemented: false,
      },
      {
        key: "bank",
        label: "Contas bancárias",
        href: "/contas-bancarias",
        icon: "landmark",
        featureKey: "financial.bank",
        permissionKey: "bank.view",
        implemented: true,
      },
      {
        key: "reconcile",
        label: "Conciliação",
        href: "/em-breve",
        icon: "arrow-left-right",
        featureKey: "financial.reconciliation",
        permissionKey: "bank.reconcile",
        implemented: false,
      },
    ],
  },
  {
    key: "cadastros",
    label: "Cadastros",
    items: [
      {
        key: "partners",
        label: "Clientes e fornecedores",
        href: "/clientes-fornecedores",
        icon: "contact",
        featureKey: null,
        permissionKey: "partners.view",
        implemented: true,
      },
      {
        key: "items",
        label: "Produtos e serviços",
        href: "/produtos-servicos",
        icon: "package",
        featureKey: "catalog.items",
        permissionKey: "items.view",
        implemented: true,
      },
    ],
  },
  {
    key: "comercial",
    label: "Comercial",
    items: [
      {
        key: "pipeline",
        label: "Funil de vendas",
        href: "/em-breve",
        icon: "kanban",
        featureKey: "commercial.pipeline",
        permissionKey: "crm.view",
        implemented: false,
      },
      {
        key: "quotes",
        label: "Propostas",
        href: "/em-breve",
        icon: "file-text",
        featureKey: "commercial.quotes",
        permissionKey: "quotes.view",
        implemented: false,
      },
    ],
  },
  {
    key: "estoque",
    label: "Estoque",
    items: [
      {
        key: "inventory",
        label: "Estoque",
        href: "/em-breve",
        icon: "boxes",
        featureKey: "inventory.balance",
        permissionKey: "inventory.view",
        implemented: false,
      },
    ],
  },
  {
    key: "relatorios",
    label: "Relatórios",
    items: [
      {
        key: "cashflow",
        label: "Fluxo de caixa",
        href: "/em-breve",
        icon: "line-chart",
        featureKey: "reports.cashflow",
        permissionKey: "reports.cashflow",
        implemented: false,
      },
      {
        key: "dre",
        label: "Resultado (DRE)",
        href: "/em-breve",
        icon: "trending-up",
        featureKey: "reports.dre",
        permissionKey: "reports.dre",
        implemented: false,
      },
    ],
  },
  {
    key: "config",
    label: "Configurações",
    items: [
      {
        key: "pessoas",
        label: "Pessoas e acessos",
        href: "/pessoas",
        icon: "users",
        featureKey: null,
        permissionKey: "access.manage",
        implemented: true,
      },
    ],
  },
];

export function buildVisibleNav(
  enabledFeatures: Set<string>,
  permissions: Set<string>,
): NavGroup[] {
  return REGISTRY.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const featureOk =
        item.featureKey === null || enabledFeatures.has(item.featureKey);
      const permOk =
        item.permissionKey === null || permissions.has(item.permissionKey);
      return featureOk && permOk;
    }),
  })).filter((group) => group.items.length > 0);
}
