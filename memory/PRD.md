# Projeto-ERP — PRD / Memória

## Problema / contexto
ERP financeiro para donos de empresa (não contadores). Next.js 15 (App Router) +
TypeScript + Tailwind + shadcn/ui. Dados e auth 100% via Supabase
(@supabase/supabase-js + @supabase/ssr). SEM backend próprio. Toda regra de
negócio vive no banco (funções SQL / RPC SECURITY DEFINER). RLS ativa + filtro
explícito por tenant_id em toda consulta. Idioma pt-BR, fuso America/Sao_Paulo.

## Arquitetura (regras permanentes)
- Camada de dados em src/lib/data/ (única a chamar supabase.from()).
- Componentes/telas nunca chamam .from() nem .rpc() direto.
- Server actions em src/app/actions/ usam cliente por-requisição (@supabase/ssr,
  lê cookies) e delegam autorização ao banco.
- Única chave permitida: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Proibido
  service_role / sb_secret_ / string de conexão.
- Sem aritmética de dinheiro em JS (cálculo vem do banco; front só formata pt-BR).
- Tipos reais em src/types/database.types.ts (16 tabelas + RPCs).
- backend/server.py = stub ASGI mínimo só para o supervisor (sem framework, sem
  Supabase, sem env de banco, frontend nunca chama). Config do supervisor é
  READONLY/gerenciada pela plataforma — não removível de forma permanente.

## Já implementado (Prompt 1)
- Auth: login, recuperação de senha, reset, aceite de convite, /auth/confirm,
  middleware, mensagens genéricas anti-enumeração.
- Camada de dados: access, branding, features, permissions-catalog, provisioning,
  roles, tenants.
- Server actions: access, provisioning, tenant.
- App shell: sidebar, header, seletor de empresa, menu dinâmico, branding por tenant.
- Assistente de primeiro acesso (/assistente) → provision_tenant() (6 perguntas).
- Pessoas e Acessos + pré-visualização "ver como esta pessoa vê".

## Auditoria (Tarefa 1) — CONCLUÍDA e APROVADA
- git grep service_role/sb_secret_/postgresql:// → vazio. supabase.from fora de
  /lib/data → vazio. Sem select *. Build/typecheck OK. /login → 200.
- role_permissions NÃO tem tenant_id (PK composta role_id+permission_key) →
  filtro por role_id derivado de member_roles (já por tenant) é o correto. Mantido.

## Correções (Tarefa 2) — CONCLUÍDAS e VERIFICADAS (testing_agent iteration_3, 5/5)
1. Removido placeholder órfão src/lib/database.types.ts (não era importado).
2. touch_member movido de (app)/layout.tsx para touchMember() em lib/data/access.ts.
3. Falso positivo do comentário resolvido (arquivo removido no item 1).

## Backlog (NÃO construir até liberar — dependem da Fase 1 do banco, inexistente)
Contas a pagar/receber, parceiros, itens, contas bancárias, conciliação,
relatórios, DRE, estoque, propostas, funil de vendas.

## Credenciais de teste → ver /app/memory/test_credentials.md
