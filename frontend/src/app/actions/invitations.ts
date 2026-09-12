"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_TENANT_COOKIE } from "@/lib/active-tenant";
import { classifyAuthError } from "@/lib/auth-errors";
import {
  acceptInvitation,
  getInvitationToken,
  revokeInvitation,
} from "@/lib/data/invitations";

// Aceita o convite na sessão do usuário (cliente criado por requisição, lendo
// os cookies). A autorização é revalidada pelo banco dentro de
// accept_invitation; não confiamos em estado vindo do cliente.
export async function acceptInviteAction(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, reason: "auth" as const };

  try {
    const tenantId = await acceptInvitation(token);
    // Deixa a pessoa já dentro da empresa do convite.
    const store = await cookies();
    store.set(ACTIVE_TENANT_COOKIE, tenantId, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
    return { ok: true as const };
  } catch (e) {
    // Falha de transporte vira "network"; erro do banco (convite inválido/
    // expirado/revogado/já usado) é sempre genérico → "invalid".
    const reason = classifyAuthError(e) === "network" ? "network" : "invalid";
    return { ok: false as const, reason };
  }
}

// Só é chamada no clique de "Copiar link". invitation_token emite evento de
// domínio a cada chamada, por isso nunca é invocada ao carregar a lista.
export async function getInvitationTokenAction(invitationId: string) {
  try {
    const token = await getInvitationToken(invitationId);
    return { ok: true as const, token };
  } catch {
    return { ok: false as const };
  }
}

export async function revokeInvitationAction(invitationId: string) {
  try {
    await revokeInvitation(invitationId);
    revalidatePath("/pessoas");
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}
