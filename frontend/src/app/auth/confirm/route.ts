import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Só permitimos redirecionar para rotas internas conhecidas (evita open redirect).
const ALLOWED_NEXT = new Set(["/reset-password", "/accept-invite", "/"]);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const requestedNext = url.searchParams.get("next") ?? "/";
  const next = ALLOWED_NEXT.has(requestedNext) ? requestedNext : "/";

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/auth-error", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(new URL("/auth-error", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
