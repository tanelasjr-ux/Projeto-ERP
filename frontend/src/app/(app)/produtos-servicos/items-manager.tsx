"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, PauseCircle, PlayCircle, Search } from "lucide-react";
import {
  fetchItemsAction,
  getItemAction,
  createItemAction,
  updateItemAction,
  setItemActiveAction,
} from "@/app/actions/items";
import type { ItemRow, ItemInput } from "@/lib/data/items";
import { formatMoneyPtBR, parseMoneyInput } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

const schema = z.object({
  kind: z.enum(["produto", "servico"]),
  name: z.string().min(1, "Informe o nome"),
  code: z.string().optional(),
  unit: z.string().optional(),
  salePrice: z.string().optional(),
  costPrice: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function kindLabel(k: string) {
  return k === "servico" ? "Serviço" : k === "produto" ? "Produto" : k;
}

export function ItemsManager({
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
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "produto" | "servico">("all");
  const [active, setActive] = useState<"active" | "inactive" | "all">("active");

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(rawQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const sort = sorting[0]?.id ?? "name";
  const dir = sorting[0]?.desc ? "desc" : "asc";

  const { data, isFetching } = useQuery({
    queryKey: ["items", tenantId, page, sort, dir, query, kind, active],
    queryFn: () =>
      fetchItemsAction({
        page,
        pageSize: PAGE_SIZE,
        sort,
        dir,
        query,
        kind: kind === "all" ? null : kind,
        active,
      }),
  });

  const [editItem, setEditItem] = useState<{ id: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["items", tenantId] });
  }

  function toggleActive(row: ItemRow) {
    startTransition(async () => {
      const res = await setItemActiveAction(row.id, !row.isActive);
      if (!res.ok) {
        toast.error(res.error ?? "Falha.");
        return;
      }
      toast.success(row.isActive ? "Item inativado." : "Item reativado.");
      invalidate();
    });
  }

  const columns = useMemo<ColumnDef<ItemRow, unknown>[]>(() => {
    const cols: ColumnDef<ItemRow, unknown>[] = [
      {
        id: "name",
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: "code",
        header: "Código",
        cell: ({ row }) => row.original.code ?? "—",
      },
      {
        id: "kind",
        header: "Tipo",
        enableSorting: false,
        cell: ({ row }) => kindLabel(row.original.kind),
      },
      {
        id: "unit",
        header: "Unid.",
        enableSorting: false,
        cell: ({ row }) => row.original.unit,
      },
      {
        id: "sale_price",
        header: "Preço de venda",
        cell: ({ row }) => formatMoneyPtBR(row.original.salePrice),
      },
      {
        id: "cost_price",
        header: "Custo",
        enableSorting: false,
        cell: ({ row }) => formatMoneyPtBR(row.original.costPrice),
      },
      {
        id: "status",
        header: "Situação",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">Ativo</Badge>
          ) : (
            <Badge variant="secondary">Inativo</Badge>
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
              onClick={() => setEditItem({ id: row.original.id })}
              data-testid={`item-edit-${row.original.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => toggleActive(row.original)}
              data-testid={`item-toggle-${row.original.id}`}
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
    <div className="space-y-6" data-testid="items-page">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Produtos e serviços
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu catálogo de itens para vender e comprar.
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)} data-testid="item-new-button">
            <Plus className="h-4 w-4" />
            Novo item
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Buscar por nome"
            className="pl-9"
            data-testid="item-search"
          />
        </div>
        <Select value={kind} onValueChange={(v) => { setKind(v as typeof kind); setPage(1); }}>
          <SelectTrigger className="sm:w-40" data-testid="item-kind-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="produto">Produtos</SelectItem>
            <SelectItem value="servico">Serviços</SelectItem>
          </SelectContent>
        </Select>
        <Select value={active} onValueChange={(v) => { setActive(v as typeof active); setPage(1); }}>
          <SelectTrigger className="sm:w-36" data-testid="item-active-filter">
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
        emptyText="Nenhum item encontrado."
      />

      {canManage ? (
        <ItemFormDialog
          open={createOpen}
          itemId={null}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            invalidate();
          }}
          onOpenExisting={(id) => {
            setCreateOpen(false);
            setEditItem({ id });
          }}
        />
      ) : null}

      {canManage && editItem ? (
        <ItemFormDialog
          open={!!editItem}
          itemId={editItem.id}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            invalidate();
          }}
          onOpenExisting={(id) => setEditItem({ id })}
        />
      ) : null}
    </div>
  );
}

function ItemFormDialog({
  open,
  itemId,
  onClose,
  onSaved,
  onOpenExisting,
}: {
  open: boolean;
  itemId: string | null;
  onClose: () => void;
  onSaved: () => void;
  onOpenExisting: (id: string) => void;
}) {
  const [dup, setDup] = useState<{ id: string | null; name: string | null } | null>(
    null,
  );
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
      kind: "produto",
      name: "",
      code: "",
      unit: "un",
      salePrice: "",
      costPrice: "",
      notes: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    setDup(null);
    if (!itemId) {
      reset({
        kind: "produto",
        name: "",
        code: "",
        unit: "un",
        salePrice: "",
        costPrice: "",
        notes: "",
        isActive: true,
      });
      return;
    }
    getItemAction(itemId).then((it) => {
      if (!it) return;
      reset({
        kind: (it.kind as "produto" | "servico") ?? "produto",
        name: it.name,
        code: it.code ?? "",
        unit: it.unit,
        salePrice: it.salePrice === null ? "" : String(it.salePrice).replace(".", ","),
        costPrice: it.costPrice === null ? "" : String(it.costPrice).replace(".", ","),
        notes: it.notes ?? "",
        isActive: it.isActive,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, itemId]);

  async function onSubmit(v: FormValues) {
    setDup(null);
    const input: ItemInput = {
      kind: v.kind,
      name: v.name.trim(),
      code: v.code?.trim() ? v.code.trim() : null,
      unit: v.unit?.trim() ? v.unit.trim() : "un",
      salePrice: parseMoneyInput(v.salePrice ?? ""),
      costPrice: parseMoneyInput(v.costPrice ?? ""),
      notes: v.notes?.trim() ? v.notes.trim() : null,
      isActive: v.isActive,
    };
    const res = itemId
      ? await updateItemAction(itemId, input)
      : await createItemAction(input);
    if (res.ok) {
      toast.success(itemId ? "Item atualizado." : "Item criado.");
      onSaved();
      return;
    }
    if ("duplicate" in res && res.duplicate) {
      setDup({ id: res.existingId ?? null, name: res.existingName ?? null });
      return;
    }
    toast.error(("error" in res ? res.error : undefined) ?? "Não foi possível salvar.");
  }

  const isActive = watch("isActive");

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="item-form-dialog">
        <DialogHeader>
          <DialogTitle>{itemId ? "Editar item" : "Novo item"}</DialogTitle>
          <DialogDescription>Produto ou serviço do seu catálogo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={watch("kind")}
                onValueChange={(v) => setValue("kind", v as "produto" | "servico")}
              >
                <SelectTrigger data-testid="item-form-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unidade</Label>
              <Input id="unit" {...register("unit")} data-testid="item-form-unit" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" autoFocus {...register("name")} data-testid="item-form-name" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">Código (opcional)</Label>
            <Input id="code" {...register("code")} data-testid="item-form-code" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="salePrice">Preço de venda</Label>
              <Input id="salePrice" inputMode="decimal" placeholder="0,00" {...register("salePrice")} data-testid="item-form-sale" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="costPrice">Custo</Label>
              <Input id="costPrice" inputMode="decimal" placeholder="0,00" {...register("costPrice")} data-testid="item-form-cost" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register("notes")} data-testid="item-form-notes" />
          </div>
          {itemId ? (
            <label className="flex items-center gap-3 rounded-md border p-3">
              <Switch
                checked={isActive}
                onCheckedChange={(c) => setValue("isActive", c)}
                data-testid="item-form-active"
              />
              <span className="text-sm">Ativo</span>
            </label>
          ) : null}

          {dup ? (
            <div
              className="rounded-md bg-destructive/10 px-3 py-3 text-sm text-destructive"
              data-testid="item-duplicate"
            >
              Já existe um item com este código.
              {dup.id ? (
                <button
                  type="button"
                  className="ml-1 font-medium underline"
                  onClick={() => onOpenExisting(dup.id!)}
                  data-testid="item-duplicate-link"
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
            <Button type="submit" disabled={isSubmitting} data-testid="item-form-save">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
