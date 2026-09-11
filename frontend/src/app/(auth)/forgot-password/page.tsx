"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // Dispara o e-mail, mas ignora o resultado para a mensagem — nunca revela
    // se a conta existe.
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    setSent(true);
  }

  return (
    <Card data-testid="forgot-card">
      <CardHeader>
        <CardTitle className="text-xl">Recuperar senha</CardTitle>
        <CardDescription>
          Enviaremos um link para você definir uma nova senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4">
            <p
              className="rounded-md bg-secondary px-3 py-3 text-sm text-secondary-foreground"
              data-testid="forgot-success"
            >
              Se este e-mail estiver cadastrado, enviamos as instruções.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login" data-testid="forgot-back-login">
                Voltar para o login
              </Link>
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            data-testid="forgot-form"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                data-testid="forgot-email-input"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              data-testid="forgot-submit-button"
            >
              {isSubmitting ? "Enviando..." : "Enviar instruções"}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">Voltar para o login</Link>
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
