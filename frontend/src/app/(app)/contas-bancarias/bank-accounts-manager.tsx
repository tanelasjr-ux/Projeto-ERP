"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, PauseCircle, PlayCircle } from "lucide-react";
import {
  fetchBankAccountsAction,
  getBankAccountAction,
  fetchPostableAssetAccountsAction,
  createBankAccountAction,
  updateBankAccountAction,
  setBankAccountActiveAction,
} from "@/app/actions/bankAccounts";
import type { BankAccountRow, BankAccountInput } from "@/lib/data/bankAccounts";
import { formatMoneyPtBR, parseMoneyInput } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

const KINDS: { value: string; label: string }[] = [
  { value: "corrente", label: "Conta corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "caixa", label: "Caixa" },
  { value: "cartao", label: "Cartão" },
  { value: "aplicacao", label: "Aplicação" },
];
function kindLabel(k: string) {
  return KINDS.find((x) => x.value === k)?.label ?? k;
}

const schema = z.object({
  name: z.string().min(1, "Informe um nome"),
  kind: z.string().min(1),
  bankCode: z.string().optional(),
  branch: z.string().optional(),
  number: z.string().optional(),
  openingBalance: z.string().optional(),
  accountId: z.string().min(1, "Escolha a conta contábil correspondente"),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function BankAccountsManager({
  tenantId,
  canManage,
}: {
  tenantId: string;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [active, setActive] = useState<"active" | "inactive" | "all">("active");

  const sort = sorting[0]?.id ?? "name";
  const dir = sorting[0]?.desc ? "desc" : "asc";

  const { data, isFetching } = useQuery({
    queryKey: ["bank", tenantId, page, sort, dir, active],
    queryFn: () =>
      fetchBankAccountsAction({ page, pageSize: PAGE_SIZE, sort, dir, active }),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["bank", tenantId] });
  }

  function toggleActive(row: BankAccountRow) {
    startTransition(async () => {
      const res = await setBankAccountActiveAction(row.id, !row.isActive);
      if (!res.ok) {
        toast.error(res.error ?? "Falha.");
        return;
      }
      toast.success(row.isActive ? "Conta inativada." : "Conta reativada.");
      invalidate();
    });
  }

  const columns = useMemo<ColumnDef<BankAccountRow, unknown>[]>(() => {
    const cols: ColumnDef<BankAccountRow, unknown>[] = [
      {
        id: "name",
        header: "Nome",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "kind",
        header: "Tipo",
        cell: ({ row }) => kindLabel(row.original.kind),
      },
      {
        id: "agnum",
        header: "Ag / Conta",
        enableSorting: false,
        cell: ({ row }) =>
          [row.original.branch, row.original.number].filter(Boolean).join(" / ") ||
          "—",
      },
      {
        id: "opening",
        header: "Saldo inicial",
        enableSorting: false,
        cell: ({ row }) => formatMoneyPtBR(row.original.openingBalance),
      },
      {
        id: "status",
        header: "Situação",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">Ativa</Badge>
          ) : (
            <Badge variant="secondary">Inativa</Badge>
          ),
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
              data-testid={`bank-edit-${row.original.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => toggleActive(row.original)}
              data-testid={`bank-toggle-${row.original.id}`}
            >
              {row.original.isActive ? (
                <PauseCircle className="h-4 w-4" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        ),
      });
    }
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, pending]);

  return (
    <div className="space-y-6" data-testid="bank-page">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Contas bancárias
          </h1>
          <p className="text-sm text-muted-foreground">
            Onde entra e sai o dinheiro da empresa.
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)} data-testid="bank-new-button">
            <Plus className="h-4 w-4" />
            Nova conta
          </Button>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Select value={active} onValueChange={(v) => { setActive(v as typeof active); setPage(1); }}>
          <SelectTrigger className="w-40" data-testid="bank-active-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="inactive">Inativas</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
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
        emptyText="Nenhuma conta bancária cadastrada."
      />

      {canManage ? (
        <BankFormDialog
          open={createOpen}
          bankId={null}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            invalidate();
          }}
        />
      ) : null}
      {canManage && editId ? (
        <BankFormDialog
          open={!!editId}
          bankId={editId}
          onClose={() => setEditId(null)}
          onSaved={() => {
            setEditId(null);
            invalidate();
          }}
        />
      ) : null}
    </div>
  );
}

function BankFormDialog({
  open,
  bankId,
  onClose,
  onSaved,
}: {
  open: boolean;
  bankId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [dupName, setDupName] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      kind: "corrente",
      bankCode: "",
      branch: "",
      number: "",
      openingBalance: "",
      accountId: "",
      isActive: true,
    },
  });

  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ["postable-asset-accounts"],
    queryFn: () => fetchPostableAssetAccountsAction(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setDupName(null);
    if (!bankId) {
      reset({
        name: "",
        kind: "corrente",
        bankCode: "",
        branch: "",
        number: "",
        openingBalance: "",
        accountId: "",
        isActive: true,
      });
      return;
    }
    getBankAccountAction(bankId).then((b) => {
      if (!b) return;
      reset({
        name: b.name,
        kind: b.kind,
        bankCode: b.bankCode ?? "",
        branch: b.branch ?? "",
        number: b.number ?? "",
        openingBalance:
          b.openingBalance === null || b.openingBalance === undefined
            ? ""
            : String(b.openingBalance).replace(".", ","),
        accountId: b.accountId,
        isActive: b.isActive,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bankId]);

  async function onSubmit(v: FormValues) {
    setDupName(null);
    const input: BankAccountInput = {
      name: v.name.trim(),
      kind: v.kind,
      bankCode: v.bankCode?.trim() ? v.bankCode.trim() : null,
      branch: v.branch?.trim() ? v.branch.trim() : null,
      number: v.number?.trim() ? v.number.trim() : null,
      openingBalance: parseMoneyInput(v.openingBalance ?? "") ?? 0,
      accountId: v.accountId,
      isActive: v.isActive,
    };
    const res = bankId
      ? await updateBankAccountAction(bankId, input)
      : await createBankAccountAction(input);
    if (res.ok) {
      toast.success(bankId ? "Conta atualizada." : "Conta criada.");
      onSaved();
      return;
    }
    if ("duplicate" in res && res.duplicate) {
      setDupName(res.existingName);
      return;
    }
    toast.error(("error" in res ? res.error : undefined) ?? "Não foi possível salvar.");
  }

  const noAccounts = !loadingAccounts && (accounts?.length ?? 0) === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="bank-form-dialog">
        <DialogHeader>
          <DialogTitle>{bankId ? "Editar conta" : "Nova conta bancária"}</DialogTitle>
          <DialogDescription>Dados da conta e sua amarra contábil.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" autoFocus {...register("name")} data-testid="bank-form-name" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={watch("kind")} onValueChange={(v) => setValue("kind", v)}>
                <SelectTrigger data-testid="bank-form-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bankCode">Banco (código)</Label>
              <Input id="bankCode" {...register("bankCode")} data-testid="bank-form-bankcode" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="branch">Agência</Label>
              <Input id="branch" {...register("branch")} data-testid="bank-form-branch" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="number">Número da conta</Label>
              <Input id="number" {...register("number")} data-testid="bank-form-number" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="openingBalance">Saldo inicial</Label>
            <Input id="openingBalance" inputMode="decimal" placeholder="0,00" {...register("openingBalance")} data-testid="bank-form-opening" />
          </div>

          <div className="space-y-1.5">
            <Label>Conta contábil correspondente</Label>
            {noAccounts ? (
              <p
                className="rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground"
                data-testid="bank-no-accounts"
              >
                O plano de contas desta empresa ainda não foi configurado.
              </p>
            ) : (
              <Select
                value={watch("accountId")}
                onValueChange={(v) => setValue("accountId", v, { shouldValidate: true })}
              >
                <SelectTrigger data-testid="bank-form-account">
                  <SelectValue placeholder={loadingAccounts ? "Carregando…" : "Escolha uma conta"} />
                </SelectTrigger>
                <SelectContent>
                  {(accounts ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} · {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              É onde esta conta aparece na contabilidade. Se não souber, escolha a
              conta de banco sugerida.
            </p>
            {errors.accountId && (
              <p className="text-xs text-destructive" data-testid="bank-form-account-error">
                {errors.accountId.message}
              </p>
            )}
          </div>

          {bankId ? (
            <label className="flex items-center gap-3 rounded-md border p-3">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(c) => setValue("isActive", c)}
                data-testid="bank-form-active"
              />
              <span className="text-sm">Ativa</span>
            </label>
          ) : null}

          {dupName ? (
            <div
              className="rounded-md bg-destructive/10 px-3 py-3 text-sm text-destructive"
              data-testid="bank-duplicate"
            >
              Já existe uma conta com este nome ({dupName}).
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || noAccounts} data-testid="bank-form-save">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
