import { createClient } from "@/lib/supabase/server";

export type PendingInvitation = {
  invitationId: string;
  email: string;
  roleName: string;
  invitedAt: string;
  expiresAt: string;
  expired: boolean;
};

// Aceita o convite. A função no banco valida internamente que o e-mail
// autenticado é o do convite e recusa expirado/revogado/já usado, sempre com a
// mesma mensagem genérica. Devolve o id da empresa do convite.
export async function acceptInvitation(token: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_invitation", {
    p_token: token,
  });
  if (error) throw error;
  return data as string;
}

// Convites pendentes da empresa. Exige access.manage internamente. O campo
// `expired` já vem calculado do banco. Não devolve o token, de propósito.
export async function listPendingInvitations(
  tenantId: string,
): Promise<PendingInvitation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_pending_invitations", {
    p_tenant: tenantId,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((i) => ({
    invitationId: i.invitation_id,
    email: i.email,
    roleName: i.role_name,
    invitedAt: i.invited_at,
    expiresAt: i.expires_at,
    expired: i.expired,
  }));
}

// Devolve o token de UM convite, sob demanda, para montar o link. Exige
// access.manage e emite evento de domínio a cada chamada — invoque apenas no
// clique de copiar o link, nunca ao carregar a lista.
export async function getInvitationToken(
  invitationId: string,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("invitation_token", {
    p_invitation: invitationId,
  });
  if (error) throw error;
  return data as string;
}

// Revoga um convite pendente. Exige access.manage internamente.
export async function revokeInvitation(invitationId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_invitation", {
    p_invitation: invitationId,
  });
  if (error) throw error;
}
