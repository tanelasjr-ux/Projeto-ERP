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

## Correção de proxy (Server Actions) — CONCLUÍDA e VERIFICADA (testing_agent iteration_4, 100%)
- Bug: "Invalid Server Actions request" ao abrir /pessoas pela URL de preview (checagem CSRF
  origin/host do Next 15 atrás do proxy; next.config.mjs tinha hosts antigos).
- Fix: next.config.mjs experimental.serverActions.allowedOrigins atualizado com o host atual
  (erp-preview-28.preview.emergentagent.com) + wildcards *.preview.emergentagent.com,
  *.preview.emergentcf.cloud, *.cluster-12.preview.emergentcf.cloud e localhost:3000.
  middleware não altera host/x-forwarded-host; sem rewrites.

## Credenciais de teste → ver /app/memory/test_credentials.md

## Tarefa 4 — tela "ver como" corrigida — CONCLUÍDA e VERIFICADA (testing_agent iteration_5, 100%)
- Bug: /pessoas/visao/[userId] mostrava "Sem permissões atribuídas" e só "Início" ao auditar
  OUTRA pessoa. Causa: RLS de member_roles/member_scopes só libera linhas do próprio usuário
  (anti-enumeração, deliberado) — consulta direta a outra pessoa retornava vazio.
- Fix (sem afrouxar RLS): types trocado via git (migration 0007 → função list_member_permissions).
  Nova função de dados src/lib/data/access.ts::listMemberPermissionDetails(tenantId,userId)
  chama .rpc('list_member_permissions') (SECURITY DEFINER, valida access.manage no banco).
  Tela reescrita: permissões agrupadas por módulo com label de negócio; risco sensivel/critico
  destacado e separado; menu derivado de features × permissões (buildVisibleNav), igual ao real;
  disclaimer deixando claro que a barra lateral é do auditor (viewas-disclaimer) e o menu da
  pessoa fica numa "janela" emoldurada (viewas-menu-panel). Nenhum .rpc() em componente.
- Verificado: Vendedor mostra 8 permissões (cadastros/comercial/financeiro), menu > só Início,
  sem DRE nem Pessoas e acessos; Dono mostra 31 permissões com badges de risco.
