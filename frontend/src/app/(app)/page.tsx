import { requireActiveTenant } from "@/lib/server-context";
import { getTenant } from "@/lib/data/tenants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const { tenantId } = await requireActiveTenant();
  const tenant = await getTenant(tenantId);
  const name = tenant?.tradeName || tenant?.legalName || "sua empresa";

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          data-testid="home-greeting"
        >
          Olá! Bem-vindo(a) à {name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Este é o seu painel. Os indicadores aparecem aqui conforme você usa o
          sistema.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { t: "A pagar hoje", d: "Sem lançamentos ainda" },
          { t: "A receber hoje", d: "Sem lançamentos ainda" },
          { t: "Saldo em contas", d: "Cadastre suas contas bancárias" },
        ].map((c) => (
          <Card key={c.t}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.t}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{c.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
