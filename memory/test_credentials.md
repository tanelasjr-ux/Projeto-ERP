# Credenciais de teste

## Supabase
- Project ID: wgflppavupmjchkvudkp
- URL: https://wgflppavupmjchkvudkp.supabase.co
- Publishable key: sb_publishable_foqvyCZV8edbh4U4gk7zmg_-8fJ8Cg6

## Conta de teste (Supabase Auth)
- E-mail: teste@exemplo.com
- Senha: 123456
- user_id: 637b760a-c63a-4196-b59b-2d723fa248e6

## Empresa provisionada (para o usuário de teste)
- tenant_id: 55bb852e-4e8e-4dcc-8174-3141a778683a
- legal_name: "Empresa Teste LTDA" (trade_name nulo → aparece a razão social)
- Papel do usuário: Dono (todas as 31 permissões)
- Features habilitadas: catalog.items, financial.core/payables/receivables/bank/reconciliation, reports.cashflow
- accent_color do branding: #1F6FEB

## Semântica de RPCs (aprendida por inspeção)
- provision_tenant(p_legal_name, p_business_type, p_tax_regime, p_sells_on_credit, p_has_inventory, p_import_balances, p_users_count, p_tax_id) → tenant_id
  - tax_regime válido: simples_nacional | lucro_presumido | lucro_real | nao_sei
  - business_type: produtos | servicos | ambos ; sells_on_credit: nao | as_vezes | sempre
- invite_member(p_tenant, p_email, p_role) → p_role é role_id (uuid), não a chave
- set_member_status(p_tenant, p_user, p_status): status válidos = active | suspended | removed
- grant_role / revoke_role (p_tenant, p_user, p_role=role_id)
- list_members(p_tenant) → [{user_id,email,status,last_seen_at,roles:[nomes]}]
- Tabela invitations NÃO é legível diretamente (só via RPC).
