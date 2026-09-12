// Dinheiro: SÓ formatação para exibição e parse de UM campo digitado.
// Nunca soma, multiplica, divide ou rateia — todo cálculo vem do banco.

const moneyFmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Exibe em pt-BR (1.234,56). Aceita number (coluna numérica) ou string.
export function formatMoneyPtBR(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  if (Number.isNaN(n)) return "—";
  return moneyFmt.format(n);
}

// Converte o texto de UM campo pt-BR em número para gravar (não é aritmética
// de dinheiro: é só interpretar o que o usuário digitou). Vazio → null.
export function parseMoneyInput(input: string | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const normalized = trimmed.replace(/\./g, "").replace(",", ".").replace(/[^\d.\-]/g, "");
  if (normalized === "" || normalized === "-") return null;
  const n = Number(normalized);
  return Number.isNaN(n) ? null : n;
}
