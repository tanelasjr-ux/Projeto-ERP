"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z
  .object({
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function AcceptInvitePage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (error) {
      toast.error("Não foi possível concluir. Peça um novo convite.");
      return;
    }
    toast.success("Acesso ativado. Bem-vindo(a)!");
    router.push("/");
    router.refresh();
  }

  return (
    <Card data-testid="invite-card">
      <CardHeader>
        <CardTitle className="text-xl">Aceitar convite</CardTitle>
        <CardDescription>
          {email
            ? `Defina sua senha para ${email}.`
            : "Defina sua senha para ativar o acesso."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasSession === false ? (
          <p
            className="rounded-md bg-destructive/10 px-3 py-3 text-sm text-destructive"
            data-testid="invite-no-session"
          >
            Convite inválido ou expirado. Solicite um novo convite ao
            administrador.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            data-testid="invite-form"
          >
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                autoFocus
                data-testid="invite-password-input"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                data-testid="invite-confirm-input"
                {...register("confirm")}
              />
              {errors.confirm && (
                <p className="text-xs text-destructive">
                  {errors.confirm.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              data-testid="invite-submit-button"
            >
              {isSubmitting ? "Ativando..." : "Ativar acesso"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
