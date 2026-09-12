"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { acceptInviteAction } from "@/app/actions/invitations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Guarda o token entre a ida ao login e a volta ao aceite, para não expô-lo na
// URL do /login (o token só pode aparecer na URL do /accept-invite).
const STORAGE_KEY = "pending_invite_token";

type State = "working" | "invalid" | "network";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [state, setState] = useState<State>("working");
  const ranRef = useRef(false);

  const attempt = useCallback(async () => {
    setState("working");
    const supabase = createClient();

    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken) sessionStorage.setItem(STORAGE_KEY, urlToken);
    const token = urlToken ?? sessionStorage.getItem(STORAGE_KEY);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Exige autenticação: manda ao login preservando o token (em
      // sessionStorage) e volta ao aceite depois de entrar.
      router.replace(`/login?next=${encodeURIComponent("/accept-invite")}`);
      return;
    }

    if (!token) {
      setState("invalid");
      return;
    }

    const res = await acceptInviteAction(token);
    if (res.ok) {
      sessionStorage.removeItem(STORAGE_KEY);
      router.replace("/");
      router.refresh();
      return;
    }
    if (res.reason === "auth") {
      router.replace(`/login?next=${encodeURIComponent("/accept-invite")}`);
      return;
    }
    setState(res.reason === "network" ? "network" : "invalid");
  }, [router]);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    attempt();
  }, [attempt]);

  if (state === "working") {
    return (
      <Card data-testid="accept-invite-card">
        <CardHeader>
          <CardTitle className="text-xl">Aceitar convite</CardTitle>
          <CardDescription>Ativando seu acesso…</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center gap-3 text-sm text-muted-foreground"
            data-testid="accept-invite-working"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Só um instante.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "network") {
    return (
      <Card data-testid="accept-invite-card">
        <CardHeader>
          <CardTitle className="text-xl">Aceitar convite</CardTitle>
          <CardDescription>Falha de conexão.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p
            className="rounded-md bg-destructive/10 px-3 py-3 text-sm text-destructive"
            data-testid="accept-invite-network"
          >
            Não foi possível conectar. Tente novamente em instantes.
          </p>
          <Button
            className="w-full"
            onClick={attempt}
            data-testid="accept-invite-retry"
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="accept-invite-card">
      <CardHeader>
        <CardTitle className="text-xl">Aceitar convite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p
          className="rounded-md bg-destructive/10 px-3 py-3 text-sm text-destructive"
          data-testid="accept-invite-error"
        >
          Convite inválido ou expirado
        </p>
        <Button
          asChild
          variant="outline"
          className="w-full"
          data-testid="accept-invite-home-link"
        >
          <Link href="/">Ir para o início</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
