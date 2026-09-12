export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_balances: {
        Row: {
          account_id: string
          credit_total: number
          debit_total: number
          month: number
          tenant_id: string
          year: number
        }
        Insert: {
          account_id: string
          credit_total?: number
          debit_total?: number
          month: number
          tenant_id: string
          year: number
        }
        Update: {
          account_id?: string
          credit_total?: number
          debit_total?: number
          month?: number
          tenant_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_balances_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_balances_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      account_templates: {
        Row: {
          code: string
          is_confidential: boolean
          is_postable: boolean
          is_suspense: boolean
          kind: Database["public"]["Enums"]["account_kind"]
          name: string
          only_business_type: string[] | null
          only_with_inventory: boolean | null
          parent_code: string | null
          report_group: string | null
          sort_order: number
          system_role: string | null
        }
        Insert: {
          code: string
          is_confidential?: boolean
          is_postable?: boolean
          is_suspense?: boolean
          kind: Database["public"]["Enums"]["account_kind"]
          name: string
          only_business_type?: string[] | null
          only_with_inventory?: boolean | null
          parent_code?: string | null
          report_group?: string | null
          sort_order?: number
          system_role?: string | null
        }
        Update: {
          code?: string
          is_confidential?: boolean
          is_postable?: boolean
          is_suspense?: boolean
          kind?: Database["public"]["Enums"]["account_kind"]
          name?: string
          only_business_type?: string[] | null
          only_with_inventory?: boolean | null
          parent_code?: string | null
          report_group?: string | null
          sort_order?: number
          system_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_templates_parent_code_fkey"
            columns: ["parent_code"]
            referencedRelation: "account_templates"
            referencedColumns: ["code"]
          },
        ]
      }
      accounts: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_confidential: boolean
          is_postable: boolean
          is_suspense: boolean
          kind: Database["public"]["Enums"]["account_kind"]
          name: string
          parent_id: string | null
          report_group: string | null
          sort_order: number
          system_role: string | null
          tenant_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_confidential?: boolean
          is_postable?: boolean
          is_suspense?: boolean
          kind: Database["public"]["Enums"]["account_kind"]
          name: string
          parent_id?: string | null
          report_group?: string | null
          sort_order?: number
          system_role?: string | null
          tenant_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_confidential?: boolean
          is_postable?: boolean
          is_suspense?: boolean
          kind?: Database["public"]["Enums"]["account_kind"]
          name?: string
          parent_id?: string | null
          report_group?: string | null
          sort_order?: number
          system_role?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          tenant_id: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          tenant_id?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_id: string
          bank_code: string | null
          branch: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          kind: string
          name: string
          number: string | null
          opening_balance: number
          tenant_id: string
        }
        Insert: {
          account_id: string
          bank_code?: string | null
          branch?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          name: string
          number?: string | null
          opening_balance?: number
          tenant_id: string
        }
        Update: {
          account_id?: string
          bank_code?: string | null
          branch?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          number?: string | null
          opening_balance?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          accrual_entry_id: string | null
          canceled_at: string | null
          category_account_id: string | null
          competence_date: string
          created_at: string
          created_by: string | null
          description: string
          doc_number: string | null
          id: string
          issue_date: string
          kind: Database["public"]["Enums"]["doc_kind"]
          notes: string | null
          partner_id: string
          status: Database["public"]["Enums"]["doc_status"]
          tenant_id: string
          total_amount: number
        }
        Insert: {
          accrual_entry_id?: string | null
          canceled_at?: string | null
          category_account_id?: string | null
          competence_date: string
          created_at?: string
          created_by?: string | null
          description: string
          doc_number?: string | null
          id?: string
          issue_date: string
          kind: Database["public"]["Enums"]["doc_kind"]
          notes?: string | null
          partner_id: string
          status?: Database["public"]["Enums"]["doc_status"]
          tenant_id: string
          total_amount: number
        }
        Update: {
          accrual_entry_id?: string | null
          canceled_at?: string | null
          category_account_id?: string | null
          competence_date?: string
          created_at?: string
          created_by?: string | null
          description?: string
          doc_number?: string | null
          id?: string
          issue_date?: string
          kind?: Database["public"]["Enums"]["doc_kind"]
          notes?: string | null
          partner_id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          tenant_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_accrual_entry_id_fkey"
            columns: ["accrual_entry_id"]
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_category_account_id_fkey"
            columns: ["category_account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_partner_id_fkey"
            columns: ["partner_id"]
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_events: {
        Row: {
          attempts: number
          id: number
          last_error: string | null
          occurred_at: string
          payload: NonNullable<Json>
          processed_at: string | null
          tenant_id: string | null
          type: string
        }
        Insert: {
          attempts?: number
          id?: number
          last_error?: string | null
          occurred_at?: string
          payload?: NonNullable<Json>
          processed_at?: string | null
          tenant_id?: string | null
          type: string
        }
        Update: {
          attempts?: number
          id?: number
          last_error?: string | null
          occurred_at?: string
          payload?: NonNullable<Json>
          processed_at?: string | null
          tenant_id?: string | null
          type?: string
        }
        Relationships: []
      }
      feature_catalog: {
        Row: {
          conflicts_with: string[]
          default_enabled: boolean
          depends_on: string[]
          description: string
          key: string
          kind: string
          label: string
          level: string
          module: string | null
          requires_history_months: number
          requires_setup: string[]
          sort_order: number
        }
        Insert: {
          conflicts_with?: string[]
          default_enabled?: boolean
          depends_on?: string[]
          description: string
          key: string
          kind: string
          label: string
          level: string
          module?: string | null
          requires_history_months?: number
          requires_setup?: string[]
          sort_order?: number
        }
        Update: {
          conflicts_with?: string[]
          default_enabled?: boolean
          depends_on?: string[]
          description?: string
          key?: string
          kind?: string
          label?: string
          level?: string
          module?: string | null
          requires_history_months?: number
          requires_setup?: string[]
          sort_order?: number
        }
        Relationships: []
      }
      fiscal_periods: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          month: number
          status: Database["public"]["Enums"]["period_status"]
          tenant_id: string
          year: number
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          month: number
          status?: Database["public"]["Enums"]["period_status"]
          tenant_id: string
          year: number
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          month?: number
          status?: Database["public"]["Enums"]["period_status"]
          tenant_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_periods_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string
          key: string
          operation: string
          result: Json | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          key: string
          operation: string
          result?: Json | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          key?: string
          operation?: string
          result?: Json | null
          tenant_id?: string
        }
        Relationships: []
      }
      installments: {
        Row: {
          amount: number
          balance: number
          document_id: string
          due_date: string
          id: string
          seq: number
          status: Database["public"]["Enums"]["doc_status"]
          tenant_id: string
        }
        Insert: {
          amount: number
          balance: number
          document_id: string
          due_date: string
          id?: string
          seq: number
          status?: Database["public"]["Enums"]["doc_status"]
          tenant_id: string
        }
        Update: {
          amount?: number
          balance?: number
          document_id?: string
          due_date?: string
          id?: string
          seq?: number
          status?: Database["public"]["Enums"]["doc_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installments_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          revoked_at: string | null
          role_id: string
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          revoked_at?: string | null
          role_id: string
          tenant_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          revoked_at?: string | null
          role_id?: string
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          code: string | null
          cost_price: number | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          kind: string
          name: string
          notes: string | null
          sale_price: number | null
          tenant_id: string
          unit: string
        }
        Insert: {
          code?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          name: string
          notes?: string | null
          sale_price?: number | null
          tenant_id: string
          unit?: string
        }
        Update: {
          code?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          notes?: string | null
          sale_price?: number | null
          tenant_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          entry_date: string
          entry_no: number
          entry_year: number
          has_suspense: boolean
          id: string
          memo: string
          reversed_by_id: string | null
          reverses_id: string | null
          source: string
          source_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entry_date: string
          entry_no: number
          entry_year: number
          has_suspense?: boolean
          id?: string
          memo: string
          reversed_by_id?: string | null
          reverses_id?: string | null
          source: string
          source_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entry_date?: string
          entry_no?: number
          entry_year?: number
          has_suspense?: boolean
          id?: string
          memo?: string
          reversed_by_id?: string | null
          reverses_id?: string | null
          source?: string
          source_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_reversed_by_id_fkey"
            columns: ["reversed_by_id"]
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_reverses_id_fkey"
            columns: ["reverses_id"]
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          amount: number
          description: string | null
          entry_id: string
          id: number
          seq: number
          side: string
          tenant_id: string
        }
        Insert: {
          account_id: string
          amount: number
          description?: string | null
          entry_id: string
          id?: number
          seq: number
          side: string
          tenant_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          description?: string | null
          entry_id?: string
          id?: number
          seq?: number
          side?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      member_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          role_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          role_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          role_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_roles_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      member_scope_items: {
        Row: {
          item_id: string
          scope_id: string
        }
        Insert: {
          item_id: string
          scope_id: string
        }
        Update: {
          item_id?: string
          scope_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_scope_items_scope_id_fkey"
            columns: ["scope_id"]
            referencedRelation: "member_scopes"
            referencedColumns: ["id"]
          },
        ]
      }
      member_scopes: {
        Row: {
          id: string
          mode: Database["public"]["Enums"]["scope_mode"]
          scope_type: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          id?: string
          mode?: Database["public"]["Enums"]["scope_mode"]
          scope_type: string
          tenant_id: string
          user_id: string
        }
        Update: {
          id?: string
          mode?: Database["public"]["Enums"]["scope_mode"]
          scope_type?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_scopes_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: NonNullable<Json>
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          is_customer: boolean
          is_supplier: boolean
          kind: string
          legal_name: string
          notes: string | null
          payment_terms: NonNullable<Json>
          phone: string | null
          tax_id: string | null
          tenant_id: string
          trade_name: string | null
        }
        Insert: {
          address?: NonNullable<Json>
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_customer?: boolean
          is_supplier?: boolean
          kind?: string
          legal_name: string
          notes?: string | null
          payment_terms?: NonNullable<Json>
          phone?: string | null
          tax_id?: string | null
          tenant_id: string
          trade_name?: string | null
        }
        Update: {
          address?: NonNullable<Json>
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_customer?: boolean
          is_supplier?: boolean
          kind?: string
          legal_name?: string
          notes?: string | null
          payment_terms?: NonNullable<Json>
          phone?: string | null
          tax_id?: string | null
          tenant_id?: string
          trade_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          description: string
          key: string
          label: string
          module: string
          risk: string
          sort_order: number
        }
        Insert: {
          description: string
          key: string
          label: string
          module: string
          risk?: string
          sort_order?: number
        }
        Update: {
          description?: string
          key?: string
          label?: string
          module?: string
          risk?: string
          sort_order?: number
        }
        Relationships: []
      }
      posting_rules: {
        Row: {
          condition: NonNullable<Json>
          created_at: string
          credit_account_id: string | null
          debit_account_id: string | null
          event: string
          id: string
          is_active: boolean
          priority: number
          tenant_id: string
        }
        Insert: {
          condition?: NonNullable<Json>
          created_at?: string
          credit_account_id?: string | null
          debit_account_id?: string | null
          event: string
          id?: string
          is_active?: boolean
          priority?: number
          tenant_id: string
        }
        Update: {
          condition?: NonNullable<Json>
          created_at?: string
          credit_account_id?: string | null
          debit_account_id?: string | null
          event?: string
          id?: string
          is_active?: boolean
          priority?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posting_rules_credit_account_id_fkey"
            columns: ["credit_account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posting_rules_debit_account_id_fkey"
            columns: ["debit_account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posting_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_key: string
          role_id: string
        }
        Insert: {
          permission_key: string
          role_id: string
        }
        Update: {
          permission_key?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: string
          name: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: string
          name: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: string
          name?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          amount: number
          bank_account_id: string
          created_at: string
          created_by: string | null
          discount: number
          fine: number
          id: string
          installment_id: string
          interest: number
          journal_entry_id: string | null
          notes: string | null
          settled_at: string
          tenant_id: string
        }
        Insert: {
          amount: number
          bank_account_id: string
          created_at?: string
          created_by?: string | null
          discount?: number
          fine?: number
          id?: string
          installment_id: string
          interest?: number
          journal_entry_id?: string | null
          notes?: string | null
          settled_at: string
          tenant_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string
          created_at?: string
          created_by?: string | null
          discount?: number
          fine?: number
          id?: string
          installment_id?: string
          interest?: number
          journal_entry_id?: string | null
          notes?: string | null
          settled_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_bank_account_id_fkey"
            columns: ["bank_account_id"]
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_installment_id_fkey"
            columns: ["installment_id"]
            referencedRelation: "installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_branding: {
        Row: {
          accent_color: string
          logo_dark_path: string | null
          logo_path: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accent_color?: string
          logo_dark_path?: string | null
          logo_path?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accent_color?: string
          logo_dark_path?: string | null
          logo_path?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_branding_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_counters: {
        Row: {
          last_value: number
          scope: string
          tenant_id: string
          year: number
        }
        Insert: {
          last_value?: number
          scope: string
          tenant_id: string
          year: number
        }
        Update: {
          last_value?: number
          scope?: string
          tenant_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "tenant_counters_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_features: {
        Row: {
          enabled: boolean
          enabled_at: string
          enabled_by: string | null
          feature_key: string
          tenant_id: string
        }
        Insert: {
          enabled: boolean
          enabled_at?: string
          enabled_by?: string | null
          feature_key: string
          tenant_id: string
        }
        Update: {
          enabled?: boolean
          enabled_at?: string
          enabled_by?: string | null
          feature_key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_feature_key_fkey"
            columns: ["feature_key"]
            referencedRelation: "feature_catalog"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          created_by: string | null
          last_seen_at: string | null
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          last_seen_at?: string | null
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          last_seen_at?: string | null
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          business_type: string | null
          created_at: string
          created_by: string | null
          currency: string
          fiscal_year_start_month: number
          id: string
          legal_name: string
          onboarding_done_at: string | null
          sells_on_credit: string | null
          settings: NonNullable<Json>
          slug: string
          tax_id: string | null
          tax_regime: string
          timezone: string
          trade_name: string | null
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          fiscal_year_start_month?: number
          id?: string
          legal_name: string
          onboarding_done_at?: string | null
          sells_on_credit?: string | null
          settings?: NonNullable<Json>
          slug: string
          tax_id?: string | null
          tax_regime?: string
          timezone?: string
          trade_name?: string | null
        }
        Update: {
          business_type?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          fiscal_year_start_month?: number
          id?: string
          legal_name?: string
          onboarding_done_at?: string | null
          sells_on_credit?: string | null
          settings?: NonNullable<Json>
          slug?: string
          tax_id?: string | null
          tax_regime?: string
          timezone?: string
          trade_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: string }
      accept_my_invitation: { Args: { p_invitation: string }; Returns: string }
      bank_balances: {
        Args: { p_tenant: string }
        Returns: {
          balance: number
          bank_account_id: string
          kind: string
          name: string
        }[]
      }
      cancel_document: {
        Args: { p_document: string; p_reason: string }
        Returns: undefined
      }
      close_period: {
        Args: { p_month: number; p_tenant: string; p_year: number }
        Returns: undefined
      }
      create_document: {
        Args: {
          p_category?: string
          p_competence_date: string
          p_description: string
          p_doc_number?: string
          p_first_due?: string
          p_installments?: number
          p_interval_days?: number
          p_issue_date: string
          p_kind: Database["public"]["Enums"]["doc_kind"]
          p_notes?: string
          p_partner: string
          p_tenant: string
          p_total: number
        }
        Returns: string
      }
      get_public_branding: {
        Args: { p_slug: string }
        Returns: {
          accent_color: string
          logo_path: string
          trade_name: string
        }[]
      }
      grant_role: {
        Args: { p_role: string; p_tenant: string; p_user: string }
        Returns: undefined
      }
      installment_totals: {
        Args: {
          p_from?: string
          p_kind: Database["public"]["Enums"]["doc_kind"]
          p_partner?: string
          p_status?: string
          p_tenant: string
          p_to?: string
        }
        Returns: {
          qtd: number
          saldo_aberto: number
          saldo_vencido: number
        }[]
      }
      invitation_token: { Args: { p_invitation: string }; Returns: string }
      invite_member: {
        Args: { p_email: string; p_role: string; p_tenant: string }
        Returns: string
      }
      list_member_permissions: {
        Args: { p_tenant: string; p_user: string }
        Returns: {
          description: string
          label: string
          module: string
          permission_key: string
          risk: string
          sort_order: number
        }[]
      }
      list_members: {
        Args: { p_tenant: string }
        Returns: {
          email: string
          last_seen_at: string
          roles: string[]
          status: string
          user_id: string
        }[]
      }
      list_pending_invitations: {
        Args: { p_tenant: string }
        Returns: {
          email: string
          expired: boolean
          expires_at: string
          invitation_id: string
          invited_at: string
          role_name: string
        }[]
      }
      list_unclassified: {
        Args: { p_tenant: string }
        Returns: {
          amount: number
          entry_date: string
          entry_id: string
          entry_no: number
          memo: string
          source: string
        }[]
      }
      my_pending_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_name: string
          expires_at: string
          invitation_id: string
          invited_at: string
          role_name: string
        }[]
      }
      post_manual_entry: {
        Args: {
          p_date: string
          p_lines: Json
          p_memo: string
          p_tenant: string
        }
        Returns: string
      }
      preview_installments: {
        Args: {
          p_count: number
          p_first_due: string
          p_interval_days?: number
          p_total: number
        }
        Returns: {
          amount: number
          due_date: string
          seq: number
        }[]
      }
      provision_tenant: {
        Args: {
          p_business_type?: string
          p_has_inventory?: boolean
          p_import_balances?: boolean
          p_legal_name: string
          p_sells_on_credit?: string
          p_tax_id?: string
          p_tax_regime?: string
          p_users_count?: number
        }
        Returns: string
      }
      reopen_period: {
        Args: { p_month: number; p_tenant: string; p_year: number }
        Returns: undefined
      }
      reverse_entry: {
        Args: { p_entry: string; p_reason: string }
        Returns: string
      }
      revoke_invitation: { Args: { p_invitation: string }; Returns: undefined }
      revoke_role: {
        Args: { p_role: string; p_tenant: string; p_user: string }
        Returns: undefined
      }
      search_partners: {
        Args: {
          p_limit?: number
          p_query?: string
          p_role?: string
          p_tenant: string
        }
        Returns: {
          email: string
          id: string
          is_customer: boolean
          is_supplier: boolean
          legal_name: string
          phone: string
          tax_id: string
          trade_name: string
        }[]
      }
      seed_missing_accounts: {
        Args: { p_has_inventory?: boolean; p_tenant: string }
        Returns: number
      }
      set_member_status: {
        Args: { p_status: string; p_tenant: string; p_user: string }
        Returns: undefined
      }
      settle_installment: {
        Args: {
          p_amount: number
          p_bank: string
          p_discount?: number
          p_fine?: number
          p_installment: string
          p_interest?: number
          p_notes?: string
          p_settled_at: string
        }
        Returns: string
      }
      touch_member: { Args: { p_tenant: string }; Returns: undefined }
      trial_balance: {
        Args: { p_month: number; p_tenant: string; p_year: number }
        Returns: {
          balance_month: number
          balance_to_date: number
          code: string
          credit_month: number
          debit_month: number
          kind: Database["public"]["Enums"]["account_kind"]
          name: string
          report_group: string
        }[]
      }
      verify_balances: {
        Args: { p_tenant: string }
        Returns: {
          account_code: string
          credit_real: number
          credit_stored: number
          debit_real: number
          debit_stored: number
          month: number
          year: number
        }[]
      }
    }
    Enums: {
      account_kind: "asset" | "liability" | "equity" | "revenue" | "expense"
      doc_kind: "payable" | "receivable"
      doc_status: "open" | "partial" | "settled" | "canceled"
      period_status: "open" | "closed"
      scope_mode: "all" | "assigned" | "own"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_kind: ["asset", "liability", "equity", "revenue", "expense"],
      doc_kind: ["payable", "receivable"],
      doc_status: ["open", "partial", "settled", "canceled"],
      period_status: ["open", "closed"],
      scope_mode: ["all", "assigned", "own"],
    },
  },
} as const
