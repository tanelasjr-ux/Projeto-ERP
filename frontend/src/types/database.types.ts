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
      revoke_invitation: { Args: { p_invitation: string }; Returns: undefined }
      revoke_role: {
        Args: { p_role: string; p_tenant: string; p_user: string }
        Returns: undefined
      }
      set_member_status: {
        Args: { p_status: string; p_tenant: string; p_user: string }
        Returns: undefined
      }
      touch_member: { Args: { p_tenant: string }; Returns: undefined }
    }
    Enums: {
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
      scope_mode: ["all", "assigned", "own"],
    },
  },
} as const
