# ERP Financeiro — PRD (memória viva)

## Contexto / Arquitetura (regras permanentes)
- Frontend Next.js 15 (App Router), TS, Tailwind, shadcn/ui, @supabase/ssr, TanStack Query/Table, react-hook-form + zod, Recharts.
- Banco Supabase Postgres JÁ EXISTE (8 migrations, 16 tabelas, RLS). NÃO criar banco/tabelas/migrations. Sem MongoDB/Prisma/ORM.
- Sem backend próprio: `/app/backend/server.py` é ASGI vazio só para o supervisor. Frontend nunca o chama.
- Toda regra de negócio no banco (funções SQL via `.rpc()`). Camada de dados em `src/lib/data/`; componentes nunca chamam `supabase.from()/.rpc()` direto.
- Só a chave publicável (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Nunca service_role/sb_secret_/connection string.
- Tipos em `src/types/database.types.ts` — espelho gerado do schema; NUNCA editar à mão. Se faltar algo, PARAR e perguntar (regenerar do schema).
- pt-BR, fuso America/Sao_Paulo. Dinheiro só formatado no front; cálculo sempre no banco.
- Env do preview atrás de proxy: host precisa estar em `experimental.serverActions.allowedOrigins` (next.config.mjs) senão "Invalid Server Actions request".

## Já existia e testado (prompts anteriores)
- Auth completa (mensagens genéricas anti-enumeração; distinção credencial inválida x rede).
- Camada de dados `src/lib/data/` e server actions `src/app/actions/`.
- App shell (sidebar, seletor de empresa, menu dinâmico por tenant_features x permissões, branding por empresa).
- Assistente de primeiro acesso (`provision_tenant`).
- Pessoas e Acessos + "ver o sistema como esta pessoa vê" (`list_member_permissions`).

## Implementado nesta sessão (aceite de convite)
Funções do banco usadas (confirmadas no database.types.ts, 785 linhas, origin/main commit b6fbdd5):
`accept_invitation`, `list_pending_invitations`, `invitation_token`, `revoke_invitation`.

- Camada de dados: `src/lib/data/invitations.ts` (acceptInvitation, listPendingInvitations, getInvitationToken, revokeInvitation).
- Server actions: `src/app/actions/invitations.ts` (acceptInviteAction seta cookie active_tenant; getInvitationTokenAction; revokeInvitationAction).
- Rota `/accept-invite`: lê `?token`, exige auth (redireciona a `/login?next=/accept-invite` preservando o token em sessionStorage, fora da URL do login), aceita via camada de dados, sucesso→home dentro da empresa, erro→"Convite inválido ou expirado" (rede é mensagem separada + retry).
- Login: honra `?next=` interno após entrar.
- Pessoas (`members-manager.tsx`): seção "Convites pendentes" — e-mail, papel, convidado em, expira em, marca "Expirado" (campo `expired`). Botões "Copiar link" (chama `invitation_token` só no clique) e "Revogar" (confirmação → `revoke_invitation` → refresh). Linha sobre não envio de e-mail. OK em 375px.
- `frontend/.env` criado com URL + chave publicável (git-ignorado).
- next.config.mjs: host atual do preview (cluster-5) adicionado em allowedOrigins/allowedDevOrigins.

### Verificado (browser, conta de teste)
- Copiar link: RPC ok, clipboard recebe `/accept-invite?token=<uuid>`, toast; sem 500/403.
- Revogar: dialog de confirmação abre.
- /accept-invite deslogado → redirect login preservando token (fora da URL) → volta ao aceite após login.
- Token inválido → exatamente "Convite inválido ou expirado".
- 375px: sem scroll horizontal de página; tabela contida/rolável.
- NÃO consumido um convite real válido (evitar alterar dados de teste) — caminho de sucesso fica para a verificação manual do usuário.

## Backlog / fora de escopo (não construir sem pedido)
- Fase 1, cadastros, contas a pagar/receber, conciliação, relatórios, estoque, propostas, funil.
