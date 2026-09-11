# ERP Financeiro — PRD

## Problema
ERP financeiro multiempresa para donos de empresa (não contadores). Stack fixa:
Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, TanStack Query/Table,
react-hook-form + zod, Recharts. Banco = Supabase Postgres (JÁ EXISTE), RLS ativa,
lógica de negócio em funções SQL chamadas via .rpc(). SEM backend próprio; acesso
via @supabase/supabase-js direto do Next.js, camada em /lib/data/. Dinheiro nunca
é calculado no cliente. UI densa, pt-BR, America/Sao_Paulo, responsiva (375px).

## Arquitetura implementada
- Next.js 15.5.25, rodando via supervisor (`yarn start` = `next dev` na porta 3000).
- Supabase SSR (@supabase/ssr) com cookies: client (browser), server (por request),
  middleware refresca sessão e protege rotas.
- Backend FastAPI é apenas um stub no-op (mantém o supervisor saudável); sem lógica.
- Tipos em src/lib/database.types.ts = PLACEHOLDER VAZIO (schema real pendente).

## Entregue (11/09/2026) — Prompt 1 parcial (fundação independente de schema)
- Autenticação: login (erro genérico "E-mail ou senha inválidos"), recuperação de
  senha (mensagem genérica), rota /auth/confirm (verifyOtp), definir nova senha
  (/reset-password), aceite de convite (/accept-invite), página de link inválido.
- Proteção de rotas por middleware; sign out.
- Base visual pt-BR: fundo branco, cor de destaque via CSS var (--brand), fontes
  IBM Plex Sans/Mono, TanStack Query provider, Sonner toasts.
- Home placeholder com saudação e e-mail do usuário.

## BLOQUEIO
O schema Supabase informado não tem as tabelas esperadas (testado: tenant_features,
tenant_branding, partners etc. => 404). Falta o arquivo /types/database.types.ts real.
Sem ele não dá para construir (regra: não inventar tabela/coluna):
- Seletor de empresa + empresa ativa no estado global
- Menu dinâmico (tenant_features × permissões)
- Branding (tenant_branding: logo, cor, monograma)
- Assistente de primeiro acesso (6 perguntas → provision_tenant())
- Tela de Pessoas e Acessos (papéis, escopo, convite, suspender/desligar, "ver como")
- Indicadores da página inicial

## Backlog (próximos prompts)
- P0: receber database.types.ts → completar Prompt 1 (menu, empresa, branding, wizard, pessoas)
- P1: Prompt 2 — parceiros, contas a pagar/receber (parcelamento no banco), itens, contas bancárias
- P2: Prompt 3 — conciliação bancária (import OFX/CSV via rota de servidor, sugestões do banco)
