import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthErrorPage() {
  return (
    <Card data-testid="auth-error-card">
      <CardHeader>
        <CardTitle className="text-xl">Link inválido</CardTitle>
        <CardDescription>
          O link é inválido ou expirou. Solicite um novo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/login" data-testid="auth-error-login-link">
            Voltar para o login
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
