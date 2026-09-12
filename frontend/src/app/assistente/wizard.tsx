"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { provisionAction } from "@/app/actions/provisioning";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

function ChoiceGroup({
  value,
  onChange,
  options,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  name: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          data-testid={`choice-${name}-${o.value}`}
          className={cn(
            "rounded-md border px-3 py-2 text-left text-sm transition-colors",
            value === o.value
              ? "border-brand bg-brand/10 font-medium text-foreground"
              : "hover:bg-accent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function OnboardingWizard({ hasTenants }: { hasTenants: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [businessType, setBusinessType] = useState("ambos");
  const [taxRegime, setTaxRegime] = useState("simples_nacional");
  const [sellsOnCredit, setSellsOnCredit] = useState("as_vezes");
  const [hasInventory, setHasInventory] = useState("nao");
  const [usersCount, setUsersCount] = useState("1");
  const [importBalances, setImportBalances] = useState("zero");
  const [submitting, setSubmitting] = useState(false);

  async function close() {
    if (hasTenants) {
      router.push("/");
    } else {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  }

  async function submit() {
    if (!legalName.trim()) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    setSubmitting(true);
    const res = await provisionAction({
      legalName: legalName.trim(),
      taxId: taxId.trim() || undefined,
      businessType,
      taxRegime,
      sellsOnCredit,
      hasInventory: hasInventory === "sim",
      importBalances: importBalances === "atuais",
      usersCount: Number(usersCount) || 1,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível configurar a empresa.");
      return;
    }
    toast.success("Empresa configurada!");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Vamos configurar sua empresa
            </h1>
            <p className="text-sm text-muted-foreground">
              Responda em linguagem do dia a dia. O resto o sistema resolve.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Fechar assistente"
            data-testid="wizard-close-button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-8 rounded-lg border p-6">
          <div className="space-y-2">
            <Label htmlFor="legalName">Nome da empresa</Label>
            <Input
              id="legalName"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Razão social ou nome fantasia"
              data-testid="wizard-legalname-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">CNPJ (opcional)</Label>
            <Input
              id="taxId"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="00.000.000/0000-00"
              data-testid="wizard-taxid-input"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">1. O que sua empresa faz?</p>
            <ChoiceGroup
              name="business"
              value={businessType}
              onChange={setBusinessType}
              options={[
                { value: "produtos", label: "Vende produtos" },
                { value: "servicos", label: "Presta serviços" },
                { value: "ambos", label: "Os dois" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">2. Como sua empresa paga imposto?</p>
            <ChoiceGroup
              name="tax"
              value={taxRegime}
              onChange={setTaxRegime}
              options={[
                { value: "simples_nacional", label: "Simples Nacional" },
                { value: "lucro_presumido", label: "Lucro Presumido" },
                { value: "lucro_real", label: "Lucro Real" },
                { value: "nao_sei", label: "Não sei, meu contador cuida" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">3. Você vende a prazo?</p>
            <ChoiceGroup
              name="credit"
              value={sellsOnCredit}
              onChange={setSellsOnCredit}
              options={[
                { value: "nao", label: "Não" },
                { value: "as_vezes", label: "Às vezes" },
                { value: "sempre", label: "Sempre" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              4. Você guarda mercadoria em estoque?
            </p>
            <ChoiceGroup
              name="inventory"
              value={hasInventory}
              onChange={setHasInventory}
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usersCount">
              5. Quantas pessoas vão usar o sistema?
            </Label>
            <Input
              id="usersCount"
              type="number"
              min={1}
              value={usersCount}
              onChange={(e) => setUsersCount(e.target.value)}
              className="max-w-[120px]"
              data-testid="wizard-users-input"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              6. Quer começar com seus saldos atuais?
            </p>
            <ChoiceGroup
              name="balances"
              value={importBalances}
              onChange={setImportBalances}
              options={[
                { value: "atuais", label: "Sim, com meus saldos atuais" },
                { value: "zero", label: "Começar do zero" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={close}>
              {hasTenants ? "Cancelar" : "Sair"}
            </Button>
            <Button
              onClick={submit}
              disabled={submitting}
              data-testid="wizard-submit-button"
            >
              {submitting ? "Configurando..." : "Concluir"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
