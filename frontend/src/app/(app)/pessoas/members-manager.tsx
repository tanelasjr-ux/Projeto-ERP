"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, UserPlus, Eye, Pencil, PauseCircle, PlayCircle, UserMinus } from "lucide-react";
import { toast } from "sonner";
import type { Member } from "@/lib/data/access";
import type { TenantRole } from "@/lib/data/roles";
import {
  inviteMemberAction,
  grantRoleAction,
  revokeRoleAction,
  setMemberStatusAction,
} from "@/app/actions/access";
import { formatDateTimePtBR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function statusBadge(status: string) {
  if (status === "active")
    return <Badge variant="success">Ativo</Badge>;
  if (status === "suspended")
    return <Badge variant="warning">Suspenso</Badge>;
  if (status === "removed")
    return <Badge variant="destructive">Desligado</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

export function MembersManager({
  tenantId,
  currentUserId,
  members,
  roles,
}: {
  tenantId: string;
  currentUserId: string;
  members: Member[];
  roles: TenantRole[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(roles[0]?.id ?? "");

  const [editMember, setEditMember] = useState<Member | null>(null);

  const rolesByName = useMemo(
    () => new Map(roles.map((r) => [r.name, r])),
    [roles],
  );

  function refresh() {
    router.refresh();
  }

  function invite() {
    if (!inviteEmail.trim() || !inviteRole) {
      toast.error("Informe e-mail e papel.");
      return;
    }
    startTransition(async () => {
      const res = await inviteMemberAction(
        tenantId,
        inviteEmail.trim(),
        inviteRole,
      );
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao convidar.");
        return;
      }
      toast.success("Convite enviado.");
      setInviteOpen(false);
      setInviteEmail("");
      refresh();
    });
  }

  function changeStatus(
    member: Member,
    status: "active" | "suspended" | "removed",
  ) {
    startTransition(async () => {
      const res = await setMemberStatusAction(tenantId, member.userId, status);
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao alterar situação.");
        return;
      }
      toast.success("Situação atualizada.");
      refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pessoas e acessos
          </h1>
          <p className="text-sm text-muted-foreground">
            Quem entra, o que cada um pode fazer e sobre quais dados.
          </p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          data-testid="invite-open-button"
        >
          <UserPlus className="h-4 w-4" />
          Convidar
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pessoa</TableHead>
              <TableHead>Papéis</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => {
              const isSelf = m.userId === currentUserId;
              return (
                <TableRow key={m.userId} data-testid={`member-row-${m.email}`}>
                  <TableCell className="font-medium">{m.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.roles.length ? (
                        m.roles.map((r) => (
                          <Badge key={r} variant="secondary">
                            {r}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(m.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTimePtBR(m.lastSeenAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="rounded-md p-1.5 hover:bg-accent"
                        data-testid={`member-actions-${m.email}`}
                        aria-label="Ações"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => setEditMember(m)}>
                          <Pencil className="h-4 w-4" />
                          Editar papéis
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/pessoas/visao/${m.userId}`}
                            data-testid={`view-as-${m.email}`}
                          >
                            <Eye className="h-4 w-4" />
                            Ver o sistema como esta pessoa
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {m.status === "suspended" ? (
                          <DropdownMenuItem
                            disabled={isSelf || pending}
                            onClick={() => changeStatus(m, "active")}
                          >
                            <PlayCircle className="h-4 w-4" />
                            Reativar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            disabled={isSelf || pending}
                            onClick={() => changeStatus(m, "suspended")}
                          >
                            <PauseCircle className="h-4 w-4" />
                            Suspender
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          disabled={isSelf || pending || m.status === "removed"}
                          className="text-destructive focus:text-destructive"
                          onClick={() => changeStatus(m, "removed")}
                          data-testid={`disable-${m.email}`}
                        >
                          <UserMinus className="h-4 w-4" />
                          Desligar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Convidar */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent data-testid="invite-dialog">
          <DialogHeader>
            <DialogTitle>Convidar pessoa</DialogTitle>
            <DialogDescription>
              Enviaremos um convite por e-mail com o papel escolhido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                data-testid="invite-email-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Papel modelo</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger data-testid="invite-role-select">
                  <SelectValue placeholder="Escolha um papel" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={invite}
              disabled={pending}
              data-testid="invite-submit-button"
            >
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar papéis */}
      <EditRolesDialog
        member={editMember}
        roles={roles}
        rolesByName={rolesByName}
        pending={pending}
        onClose={() => setEditMember(null)}
        onGrant={(roleId) =>
          new Promise<boolean>((resolve) => {
            startTransition(async () => {
              const res = await grantRoleAction(
                tenantId,
                editMember!.userId,
                roleId,
              );
              if (!res.ok) toast.error(res.error ?? "Falha ao conceder papel.");
              resolve(res.ok);
            });
          })
        }
        onRevoke={(roleId) =>
          new Promise<boolean>((resolve) => {
            startTransition(async () => {
              const res = await revokeRoleAction(
                tenantId,
                editMember!.userId,
                roleId,
              );
              if (!res.ok) toast.error(res.error ?? "Falha ao remover papel.");
              resolve(res.ok);
            });
          })
        }
        onDone={() => {
          setEditMember(null);
          refresh();
        }}
      />
    </div>
  );
}

function EditRolesDialog({
  member,
  roles,
  rolesByName,
  pending,
  onClose,
  onGrant,
  onRevoke,
  onDone,
}: {
  member: Member | null;
  roles: TenantRole[];
  rolesByName: Map<string, TenantRole>;
  pending: boolean;
  onClose: () => void;
  onGrant: (roleId: string) => Promise<boolean>;
  onRevoke: (roleId: string) => Promise<boolean>;
  onDone: () => void;
}) {
  const initial = useMemo(() => {
    const set = new Set<string>();
    if (member) {
      for (const name of member.roles) {
        const r = rolesByName.get(name);
        if (r) set.add(r.id);
      }
    }
    return set;
  }, [member, rolesByName]);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Sincroniza quando abre com outro membro.
  const [lastMemberId, setLastMemberId] = useState<string | null>(null);
  if (member && member.userId !== lastMemberId) {
    setLastMemberId(member.userId);
    setChecked(new Set(initial));
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    if (!member) return;
    setSaving(true);
    let ok = true;
    for (const r of roles) {
      const was = initial.has(r.id);
      const now = checked.has(r.id);
      if (now && !was) ok = (await onGrant(r.id)) && ok;
      else if (!now && was) ok = (await onRevoke(r.id)) && ok;
    }
    setSaving(false);
    if (ok) {
      toast.success("Papéis atualizados.");
      onDone();
    }
  }

  return (
    <Dialog open={!!member} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent data-testid="edit-roles-dialog">
        <DialogHeader>
          <DialogTitle>Editar papéis</DialogTitle>
          <DialogDescription>{member?.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {roles.map((r) => (
            <label
              key={r.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={checked.has(r.id)}
                onChange={() => toggle(r.id)}
                data-testid={`role-checkbox-${r.key}`}
              />
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                {r.description ? (
                  <p className="text-xs text-muted-foreground">
                    {r.description}
                  </p>
                ) : null}
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={saving || pending}
            data-testid="edit-roles-save-button"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
