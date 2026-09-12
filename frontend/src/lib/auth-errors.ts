import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";

export type AuthFailure = "invalid-credentials" | "network" | "other";

// Distingue credencial inválida (HTTP 400 da auth) de falha de rede/serviço.
// Decide por name/status (nunca pela mensagem) e não vaza se a conta existe.
export function classifyAuthError(error: unknown): AuthFailure {
  if (!error) return "other";
  const e = error as { name?: string; status?: number };

  if (
    (error instanceof AuthApiError || e.name === "AuthApiError") &&
    e.status === 400
  ) {
    return "invalid-credentials";
  }

  // status 0 = sem resposta HTTP (transporte); >=500 = serviço indisponível.
  if (
    error instanceof AuthRetryableFetchError ||
    e.name === "AuthRetryableFetchError" ||
    e.status === 0 ||
    (typeof e.status === "number" && e.status >= 500)
  ) {
    return "network";
  }

  if (error instanceof TypeError || e.name === "TypeError") return "network";
  return "other";
}

export const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos";
export const NETWORK_MESSAGE =
  "Não foi possível conectar. Tente novamente em instantes.";
