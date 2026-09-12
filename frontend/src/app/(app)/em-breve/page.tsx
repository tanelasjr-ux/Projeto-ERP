import { Construction } from "lucide-react";

export default function EmBrevePage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <Construction className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold" data-testid="em-breve-title">
        Em breve
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Este módulo está habilitado para a sua empresa e será liberado nas
        próximas etapas.
      </p>
    </div>
  );
}
