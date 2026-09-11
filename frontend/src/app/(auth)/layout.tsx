export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-brand-foreground font-bold">
              F
            </div>
            <span className="text-lg font-semibold tracking-tight">
              ERP Financeiro
            </span>
          </div>
          {children}
        </div>
      </div>
      <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        Fuso America/Sao_Paulo · pt-BR
      </footer>
    </div>
  );
}
