"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import {
  classifyAuthError,
  INVALID_CREDENTIALS_MESSAGE,
  NETWORK_MESSAGE,
} from "@/lib/auth-errors";
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

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        // 400 = credencial inválida (mensagem genérica, não revela a conta).
        // Qualquer falha de rede/serviço vira a mensagem de conexão.
        setError(
          classifyAuthError(error) === "invalid-credentials"
            ? INVALID_CREDENTIALS_MESSAGE
            : NETWORK_MESSAGE,
        );
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      // Erro de transporte lançado (ex.: "Failed to fetch"/ERR_FAILED).
      setError(NETWORK_MESSAGE);
    }
  }

  return (
    <Card data-testid="login-card">
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>
          Acesse a gestão financeira da sua empresa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-testid="login-form"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              data-testid="login-email-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive" data-testid="login-email-error">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand hover:underline"
                data-testid="login-forgot-link"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              data-testid="login-password-input"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          {error && (
            <p
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              data-testid="login-error"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            data-testid="login-submit-button"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
