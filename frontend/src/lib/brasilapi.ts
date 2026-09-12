import { onlyDigits } from "@/lib/br-docs";

// Consulta pública de CNPJ (client-side). É oferta de preenchimento: o serviço
// fora do ar nunca impede o cadastro manual — quem chama trata a falha.
export type CnpjLookup = {
  legalName: string;
  tradeName: string;
  address: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
};

export async function lookupCnpj(cnpj: string): Promise<CnpjLookup> {
  const digits = onlyDigits(cnpj);
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
  if (!res.ok) throw new Error("Consulta indisponível");
  const j = await res.json();
  return {
    legalName: j.razao_social ?? "",
    tradeName: j.nome_fantasia ?? "",
    address: {
      cep: onlyDigits(j.cep ?? ""),
      logradouro: j.logradouro ?? "",
      numero: j.numero ? String(j.numero) : "",
      complemento: j.complemento ?? "",
      bairro: j.bairro ?? "",
      cidade: j.municipio ?? "",
      uf: j.uf ?? "",
    },
  };
}
