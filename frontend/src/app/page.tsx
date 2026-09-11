import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground text-sm font-bold">
            F
          </div>
          <span className="font-semibold tracking-tight">ERP Financeiro</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden text-sm text-muted-foreground sm:inline"
            data-testid="header-user-email"
          >
            {user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <h1
          className="text-2xl font-semibold tracking-tight"
          data-testid="home-greeting"
        >
          Bem-vindo(a) ao ERP Financeiro
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sua sessão está ativa. Os indicadores da página inicial e o menu da
          empresa serão montados assim que o schema do banco estiver disponível.
        </p>

        <div className="mt-8 rounded-lg border border-dashed p-6">
          <h2 className="font-medium">Fundação instalada</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>· Autenticação (login, recuperação e aceite de convite)</li>
            <li>· Sessão via cookies (Supabase SSR) e proteção de rotas</li>
            <li>· Base visual pt-BR, fundo branco e cor de destaque por CSS var</li>
          </ul>
          <p className="mt-4 text-sm text-warning">
            Pendente: seletor de empresa, menu dinâmico (tenant_features +
            permissões), branding (tenant_branding), assistente de primeiro
            acesso (provision_tenant) e tela de Pessoas e Acessos — aguardando o
            arquivo <code className="font-mono">database.types.ts</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
