"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, PauseCircle, PlayCircle, Search, Building2, Loader2 } from "lucide-react";
import {
  fetchPartnersAction,
  getPartnerAction,
  createPartnerAction,
  updatePartnerAction,
  setPartnerActiveAction,
} from "@/app/actions/partners";
import type { PartnerRow, PartnerInput } from "@/lib/data/partners";
import { formatTaxId, isValidCPF, isValidCNPJ, onlyDigits } from "@/lib/br-docs";
import { lookupCnpj, type CnpjLookup } from "@/lib/brasilapi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 20;

const schema = z
  .object({
    kind: z.enum(["pf", "pj"]),
    legalName: z.string().min(1, "Informe a razão social ou o nome"),
    tradeName: z.string().optional(),
    taxId: z.string().optional(),
    isCustomer: z.boolean(),
    isSupplier: z.boolean(),
    email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
    phone: z.string().optional(),
    cep: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    uf: z.string().optional(),
    prazoDias: z.string().optional(),
    observacao: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine((v) => v.isCustomer || v.isSupplier, {
    message: "Marque se é cliente, fornecedor, ou os dois",
    path: ["isCustomer"],
  })
  .refine(
    (v) => {
      const d = onlyDigits(v.taxId);
      if (!d) return true;
      return v.kind === "pf" ? isValidCPF(d) : isValidCNPJ(d);
    },
    { message: "Documento inválido", path: ["taxId"] },
  );
type FormValues = z.infer<typeof schema>;

export function PartnersManager({
  tenantId,
  canManage,
}: {
  tenantId: string;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "legal_name", desc: false },
  ]);
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | "customer" | "supplier">("all");
  const [active, setActive] = useState<"active" | "inactive" | "all">("active");

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(rawQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const sort = sorting[0]?.id ?? "legal_name";
  const dir = sorting[0]?.desc ? "desc" : "asc";

  const { data, isFetching } = useQuery({
    queryKey: ["partners", tenantId, page, sort, dir, query, role, active],
    queryFn: () =>
      fetchPartnersAction({
        page,
        pageSize: PAGE_SIZE,
        sort,
        dir,
        query,
        role: role === "all" ? null : role,
        active,
      }),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["partners", tenantId] });
  }

  function toggleActive(row: PartnerRow) {
    startTransition(async () => {
      const res = await setPartnerActiveAction(row.id, !row.isActive);
      if (!res.ok) {
        toast.error(res.error ?? "Falha.");
        return;
      }
      toast.success(row.isActive ? "Cadastro inativado." : "Cadastro reativado.");
      invalidate();
    });
  }

  const searched = data?.searched ?? false;

  const columns = useMemo<ColumnDef<PartnerRow, unknown>[]>(() => {
    const cols: ColumnDef<PartnerRow, unknown>[] = [
      {
        id: "legal_name",
        header: "Nome",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium">{row.original.legalName}</div>
            {row.original.tradeName ? (
              <div className="text-xs text-muted-foreground">
                {row.original.tradeName}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        id: "tax_id",
        header: "Documento",
        cell: ({ row }) =>
          row.original.taxId ? formatTaxId(row.original.taxId) : "—",
      },
      {
        id: "roles",
        header: "Papéis",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.isCustomer ? <Badge variant="secondary">Cliente</Badge> : null}
            {row.original.isSupplier ? <Badge variant="secondary">Fornecedor</Badge> : null}
          </div>
        ),
      },
      {
        id: "email",
        header: "E-mail",
        enableSorting: false,
        cell: ({ row }) => row.original.email ?? "—",
      },
      {
        id: "phone",
        header: "Telefone",
        enableSorting: false,
        cell: ({ row }) => row.original.phone ?? "—",
      },
    ];
    if (canManage) {
      cols.push({
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditId(row.original.id)}
              data-testid={`partner-edit-${row.original.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {!searched ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => toggleActive(row.original)}
                data-testid={`partner-toggle-${row.original.id}`}
              >
                {row.original.isActive ? (
                  <PauseCircle className="h-4 w-4" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
              </Button>
            ) : null}
          </div>
        ),
      });
    }
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, pending, searched]);

  return (
    <div className="space-y-6" data-testid="partners-page">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Clientes e fornecedores
          </h1>
          <p className="text-sm text-muted-foreground">
            Um cadastro só, mesmo quem é cliente e fornecedor ao mesmo tempo.
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)} data-testid="partner-new-button">
            <Plus className="h-4 w-4" />
            Novo cadastro
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Buscar por nome ou documento"
            className="pl-9"
            data-testid="partner-search"
          />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v as typeof role); setPage(1); }}>
          <SelectTrigger className="sm:w-40" data-testid="partner-role-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os papéis</SelectItem>
            <SelectItem value="customer">Clientes</SelectItem>
            <SelectItem value="supplier">Fornecedores</SelectItem>
          </SelectContent>
        </Select>
        <Select value={active} onValueChange={(v) => { setActive(v as typeof active); setPage(1); }} disabled={searched}>
          <SelectTrigger className="sm:w-36" data-testid="partner-active-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        sorting={sorting}
        onSortingChange={(u) => {
          setSorting(u);
          setPage(1);
        }}
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        isLoading={isFetching}
        emptyText="Nenhum cadastro encontrado."
        serverPaginated={!searched}
      />

      {canManage ? (
        <PartnerFormDialog
          open={createOpen}
          partnerId={null}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            invalidate();
          }}
          onOpenExisting={(id) => {
            setCreateOpen(false);
            setEditId(id);
          }}
        />
      ) : null}
      {canManage && editId ? (
        <PartnerFormDialog
          open={!!editId}
          partnerId={editId}
          onClose={() => setEditId(null)}
          onSaved={() => {
            setEditId(null);
            invalidate();
          }}
          onOpenExisting={(id) => setEditId(id)}
        />
      ) : null}
    </div>
  );
}

function PartnerFormDialog({
  open,
  partnerId,
  onClose,
  onSaved,
  onOpenExisting,
}: {
  open: boolean;
  partnerId: string | null;
  onClose: () => void;
  onSaved: () => void;
  onOpenExisting: (id: string) => void;
}) {
  const [dup, setDup] = useState<{ id: string | null; name: string | null } | null>(null);
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "error">("idle");
  const [suggestion, setSuggestion] = useState<CnpjLookup | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm(),
  });

  useEffect(() => {
    if (!open) return;
    setDup(null);
    setSuggestion(null);
    setLookupState("idle");
    if (!partnerId) {
      reset(emptyForm());
      return;
    }
    getPartnerAction(partnerId).then((p) => {
      if (!p) return;
      reset({
        kind: (p.kind as "pf" | "pj") || "pj",
        legalName: p.legalName,
        tradeName: p.tradeName ?? "",
        taxId: p.taxId ? formatTaxId(p.taxId) : "",
        isCustomer: p.isCustomer,
        isSupplier: p.isSupplier,
        email: p.email ?? "",
        phone: p.phone ?? "",
        cep: p.address.cep,
        logradouro: p.address.logradouro,
        numero: p.address.numero,
        complemento: p.address.complemento,
        bairro: p.address.bairro,
        cidade: p.address.cidade,
        uf: p.address.uf,
        prazoDias:
          p.paymentTerms.prazo_dias === null ? "" : String(p.paymentTerms.prazo_dias),
        observacao: p.paymentTerms.observacao,
        notes: p.notes ?? "",
        isActive: p.isActive,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, partnerId]);

  const kind = watch("kind");
  const taxId = watch("taxId");
  const canLookup = kind === "pj" && isValidCNPJ(onlyDigits(taxId));

  async function doLookup() {
    setLookupState("loading");
    setSuggestion(null);
    try {
      const r = await lookupCnpj(onlyDigits(taxId));
      setSuggestion(r);
      setLookupState("idle");
    } catch {
      // Falha não impede o cadastro manual: aviso discreto, form segue editável.
      setLookupState("error");
    }
  }

  function applySuggestion() {
    if (!suggestion) return;
    if (suggestion.legalName) setValue("legalName", suggestion.legalName);
    if (suggestion.tradeName) setValue("tradeName", suggestion.tradeName);
    const a = suggestion.address;
    setValue("cep", a.cep);
    setValue("logradouro", a.logradouro);
    setValue("numero", a.numero);
    setValue("complemento", a.complemento);
    setValue("bairro", a.bairro);
    setValue("cidade", a.cidade);
    setValue("uf", a.uf);
    setSuggestion(null);
  }

  async function onSubmit(v: FormValues) {
    setDup(null);
    const input: PartnerInput = {
      kind: v.kind,
      legalName: v.legalName.trim(),
      tradeName: v.tradeName?.trim() ? v.tradeName.trim() : null,
      taxId: onlyDigits(v.taxId) ? onlyDigits(v.taxId) : null,
      isCustomer: v.isCustomer,
      isSupplier: v.isSupplier,
      email: v.email?.trim() ? v.email.trim() : null,
      phone: v.phone?.trim() ? v.phone.trim() : null,
      address: {
        cep: onlyDigits(v.cep),
        logradouro: v.logradouro?.trim() ?? "",
        numero: v.numero?.trim() ?? "",
        complemento: v.complemento?.trim() ?? "",
        bairro: v.bairro?.trim() ?? "",
        cidade: v.cidade?.trim() ?? "",
        uf: (v.uf?.trim() ?? "").toUpperCase(),
      },
      paymentTerms: {
        prazo_dias: v.prazoDias && v.prazoDias.trim() ? Number(onlyDigits(v.prazoDias)) : null,
        observacao: v.observacao?.trim() ?? "",
      },
      notes: v.notes?.trim() ? v.notes.trim() : null,
      isActive: v.isActive,
    };
    const res = partnerId
      ? await updatePartnerAction(partnerId, input)
      : await createPartnerAction(input);
    if (res.ok) {
      toast.success(partnerId ? "Cadastro atualizado." : "Cadastro criado.");
      onSaved();
      return;
    }
    if ("duplicate" in res && res.duplicate) {
      setDup({ id: res.existingId ?? null, name: res.existingName ?? null });
      return;
    }
    toast.error(("error" in res ? res.error : undefined) ?? "Não foi possível salvar.");
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" data-testid="partner-form-dialog">
        <DialogHeader>
          <DialogTitle>{partnerId ? "Editar cadastro" : "Novo cadastro"}</DialogTitle>
          <DialogDescription>Cliente, fornecedor, ou os dois.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={kind} onValueChange={(val) => setValue("kind", val as "pf" | "pj")}>
                <SelectTrigger data-testid="partner-form-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pj">Pessoa jurídica</SelectItem>
                  <SelectItem value="pf">Pessoa física</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxId">{kind === "pf" ? "CPF" : "CNPJ"}</Label>
              <div className="flex gap-2">
                <Input id="taxId" {...register("taxId")} data-testid="partner-form-taxid" />
                {kind === "pj" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canLookup || lookupState === "loading"}
                    onClick={doLookup}
                    data-testid="partner-lookup-button"
                  >
                    {lookupState === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    Buscar dados
                  </Button>
                ) : null}
              </div>
              {errors.taxId && (
                <p className="text-xs text-destructive" data-testid="partner-taxid-error">
                  {errors.taxId.message}
                </p>
              )}
              {lookupState === "error" ? (
                <p className="text-xs text-amber-600" data-testid="partner-lookup-error">
                  Consulta indisponível agora. Você pode preencher manualmente.
                </p>
              ) : null}
            </div>
          </div>

          {suggestion ? (
            <div className="rounded-md border bg-secondary/50 p-3 text-sm" data-testid="partner-lookup-suggestion">
              <p className="mb-1 font-medium">Encontramos estes dados. Deseja usar?</p>
              <ul className="mb-2 space-y-0.5 text-muted-foreground">
                {suggestion.legalName ? <li>Razão social: {suggestion.legalName}</li> : null}
                {suggestion.tradeName ? <li>Nome fantasia: {suggestion.tradeName}</li> : null}
                {suggestion.address.logradouro ? (
                  <li>
                    Endereço: {suggestion.address.logradouro}
                    {suggestion.address.cidade ? `, ${suggestion.address.cidade}` : ""}
                    {suggestion.address.uf ? `/${suggestion.address.uf}` : ""}
                  </li>
                ) : null}
              </ul>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={applySuggestion} data-testid="partner-lookup-apply">
                  Preencher
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSuggestion(null)}>
                  Descartar
                </Button>
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="legalName">{kind === "pf" ? "Nome completo" : "Razão social"}</Label>
            <Input id="legalName" {...register("legalName")} data-testid="partner-form-legalname" />
            {errors.legalName && (
              <p className="text-xs text-destructive">{errors.legalName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tradeName">Nome fantasia</Label>
            <Input id="tradeName" {...register("tradeName")} data-testid="partner-form-tradename" />
          </div>

          <div className="space-y-2">
            <Label>Papéis</Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={watch("isCustomer")}
                  onCheckedChange={(c) => setValue("isCustomer", !!c, { shouldValidate: true })}
                  data-testid="partner-form-customer"
                />
                Cliente
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={watch("isSupplier")}
                  onCheckedChange={(c) => setValue("isSupplier", !!c, { shouldValidate: true })}
                  data-testid="partner-form-supplier"
                />
                Fornecedor
              </label>
            </div>
            {errors.isCustomer && (
              <p className="text-xs text-destructive" data-testid="partner-roles-error">
                {errors.isCustomer.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} data-testid="partner-form-email" />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} data-testid="partner-form-phone" />
            </div>
          </div>

          <fieldset className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Endereço
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" {...register("cep")} data-testid="partner-form-cep" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input id="logradouro" {...register("logradouro")} data-testid="partner-form-logradouro" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" {...register("numero")} data-testid="partner-form-numero" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" {...register("complemento")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" {...register("bairro")} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" {...register("cidade")} data-testid="partner-form-cidade" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" maxLength={2} {...register("uf")} data-testid="partner-form-uf" />
              </div>
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prazoDias">Prazo de pagamento (dias)</Label>
              <Input id="prazoDias" inputMode="numeric" {...register("prazoDias")} data-testid="partner-form-prazo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="observacao">Observação de pagamento</Label>
              <Input id="observacao" {...register("observacao")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register("notes")} data-testid="partner-form-notes" />
          </div>

          {partnerId ? (
            <label className="flex items-center gap-3 rounded-md border p-3">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(c) => setValue("isActive", c)}
                data-testid="partner-form-active"
              />
              <span className="text-sm">Ativo</span>
            </label>
          ) : null}

          {dup ? (
            <div className="rounded-md bg-destructive/10 px-3 py-3 text-sm text-destructive" data-testid="partner-duplicate">
              Já existe um cadastro com este {kind === "pf" ? "CPF" : "CNPJ"}.
              {dup.id ? (
                <button
                  type="button"
                  className="ml-1 font-medium underline"
                  onClick={() => onOpenExisting(dup.id!)}
                  data-testid="partner-duplicate-link"
                >
                  Ver cadastro existente{dup.name ? ` (${dup.name})` : ""}
                </button>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="partner-form-save">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function emptyForm(): FormValues {
  return {
    kind: "pj",
    legalName: "",
    tradeName: "",
    taxId: "",
    isCustomer: true,
    isSupplier: false,
    email: "",
    phone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    prazoDias: "",
    observacao: "",
    notes: "",
    isActive: true,
  };
}
