export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      auth_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          email: string | null
          id: string
          ip: string | null
          success: boolean
        }
        Insert: {
          attempt_type: string
          created_at?: string
          email?: string | null
          id?: string
          ip?: string | null
          success?: boolean
        }
        Update: {
          attempt_type?: string
          created_at?: string
          email?: string | null
          id?: string
          ip?: string | null
          success?: boolean
        }
        Relationships: []
      }
      brands: {
        Row: {
          active: boolean
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      carrinho_cotacao: {
        Row: {
          ca_number: string | null
          categoria: string | null
          created_at: string
          id: string
          image_url: string | null
          nome: string
          produto_id: string | null
          quantidade: number
          sku: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ca_number?: string | null
          categoria?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          nome: string
          produto_id?: string | null
          quantidade?: number
          sku: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ca_number?: string | null
          categoria?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          nome?: string
          produto_id?: string | null
          quantidade?: number
          sku?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrinho_cotacao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cotacao_historico_status: {
        Row: {
          alterado_por: string | null
          cotacao_id: string
          created_at: string
          id: string
          status_anterior: Database["public"]["Enums"]["cotacao_status"] | null
          status_novo: Database["public"]["Enums"]["cotacao_status"]
        }
        Insert: {
          alterado_por?: string | null
          cotacao_id: string
          created_at?: string
          id?: string
          status_anterior?: Database["public"]["Enums"]["cotacao_status"] | null
          status_novo: Database["public"]["Enums"]["cotacao_status"]
        }
        Update: {
          alterado_por?: string | null
          cotacao_id?: string
          created_at?: string
          id?: string
          status_anterior?: Database["public"]["Enums"]["cotacao_status"] | null
          status_novo?: Database["public"]["Enums"]["cotacao_status"]
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_historico_status_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      cotacao_itens: {
        Row: {
          ca_number: string | null
          categoria: string | null
          cotacao_id: string
          created_at: string
          id: string
          image_url: string | null
          nome: string
          preco_unitario: number | null
          quantidade: number
          sku: string
        }
        Insert: {
          ca_number?: string | null
          categoria?: string | null
          cotacao_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          nome: string
          preco_unitario?: number | null
          quantidade?: number
          sku: string
        }
        Update: {
          ca_number?: string | null
          categoria?: string | null
          cotacao_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          nome?: string
          preco_unitario?: number | null
          quantidade?: number
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_itens_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      cotacao_notificacoes: {
        Row: {
          cotacao_id: string
          created_at: string
          erro: string | null
          id: string
          status_envio: Database["public"]["Enums"]["notificacao_status"]
          tentativas: number
          tipo: Database["public"]["Enums"]["notificacao_tipo"]
          updated_at: string
        }
        Insert: {
          cotacao_id: string
          created_at?: string
          erro?: string | null
          id?: string
          status_envio?: Database["public"]["Enums"]["notificacao_status"]
          tentativas?: number
          tipo: Database["public"]["Enums"]["notificacao_tipo"]
          updated_at?: string
        }
        Update: {
          cotacao_id?: string
          created_at?: string
          erro?: string | null
          id?: string
          status_envio?: Database["public"]["Enums"]["notificacao_status"]
          tentativas?: number
          tipo?: Database["public"]["Enums"]["notificacao_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_notificacoes_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      cotacoes: {
        Row: {
          cnpj: string | null
          condicoes_pagamento: string | null
          created_at: string
          email_contato: string
          empresa: string
          endereco_entrega: string | null
          frete: string | null
          id: string
          impostos: string | null
          motivo_devolucao: string | null
          nome_contato: string
          notificacao_enviada_em: string | null
          notificacao_processando_em: string | null
          numero_cotacao: number
          observacoes: string | null
          prazo_entrega: string | null
          proposta_mensagem: string | null
          respondido_em: string | null
          respondido_por: string | null
          status: Database["public"]["Enums"]["cotacao_status"]
          telefone: string
          updated_at: string
          user_id: string
          validade_orcamento_dias: number | null
          visualizado_em: string | null
          visualizado_por: string | null
        }
        Insert: {
          cnpj?: string | null
          condicoes_pagamento?: string | null
          created_at?: string
          email_contato: string
          empresa: string
          endereco_entrega?: string | null
          frete?: string | null
          id?: string
          impostos?: string | null
          motivo_devolucao?: string | null
          nome_contato: string
          notificacao_enviada_em?: string | null
          notificacao_processando_em?: string | null
          numero_cotacao?: number
          observacoes?: string | null
          prazo_entrega?: string | null
          proposta_mensagem?: string | null
          respondido_em?: string | null
          respondido_por?: string | null
          status?: Database["public"]["Enums"]["cotacao_status"]
          telefone: string
          updated_at?: string
          user_id: string
          validade_orcamento_dias?: number | null
          visualizado_em?: string | null
          visualizado_por?: string | null
        }
        Update: {
          cnpj?: string | null
          condicoes_pagamento?: string | null
          created_at?: string
          email_contato?: string
          empresa?: string
          endereco_entrega?: string | null
          frete?: string | null
          id?: string
          impostos?: string | null
          motivo_devolucao?: string | null
          nome_contato?: string
          notificacao_enviada_em?: string | null
          notificacao_processando_em?: string | null
          numero_cotacao?: number
          observacoes?: string | null
          prazo_entrega?: string | null
          proposta_mensagem?: string | null
          respondido_em?: string | null
          respondido_por?: string | null
          status?: Database["public"]["Enums"]["cotacao_status"]
          telefone?: string
          updated_at?: string
          user_id?: string
          validade_orcamento_dias?: number | null
          visualizado_em?: string | null
          visualizado_por?: string | null
        }
        Relationships: []
      }
      empresa_change_requests: {
        Row: {
          campo_alterado: string
          created_at: string
          empresa_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["change_request_status"]
          user_id: string
          valor_atual: string | null
          valor_proposto: string | null
        }
        Insert: {
          campo_alterado: string
          created_at?: string
          empresa_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["change_request_status"]
          user_id: string
          valor_atual?: string | null
          valor_proposto?: string | null
        }
        Update: {
          campo_alterado?: string
          created_at?: string
          empresa_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["change_request_status"]
          user_id?: string
          valor_atual?: string | null
          valor_proposto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresa_change_requests_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string
          created_at: string
          endereco_cadastral: string | null
          id: string
          logo_url: string | null
          nome_contato: string
          razao_social: string
          status: Database["public"]["Enums"]["empresa_status"]
          telefone_contato: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          endereco_cadastral?: string | null
          id?: string
          logo_url?: string | null
          nome_contato: string
          razao_social: string
          status?: Database["public"]["Enums"]["empresa_status"]
          telefone_contato: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          endereco_cadastral?: string | null
          id?: string
          logo_url?: string | null
          nome_contato?: string
          razao_social?: string
          status?: Database["public"]["Enums"]["empresa_status"]
          telefone_contato?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean
          created_at: string
          href: string | null
          id: string
          logo_url: string
          name: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          href?: string | null
          id?: string
          logo_url: string
          name: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          href?: string | null
          id?: string
          logo_url?: string
          name?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          ca_number: string | null
          category: string
          created_at: string
          featured: boolean
          id: string
          image_url: string | null
          long_description: string | null
          name: string
          norms: string[]
          published: boolean
          short_description: string
          sku: string
          slug: string
          sort_order: number
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          ca_number?: string | null
          category: string
          created_at?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          long_description?: string | null
          name: string
          norms?: string[]
          published?: boolean
          short_description: string
          sku: string
          slug: string
          sort_order?: number
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          ca_number?: string | null
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          long_description?: string | null
          name?: string
          norms?: string[]
          published?: boolean
          short_description?: string
          sku?: string
          slug?: string
          sort_order?: number
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aprovar_change_request: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      atualizar_logo_empresa: {
        Args: { p_logo_url: string }
        Returns: undefined
      }
      claim_nova_cotacao_notification: {
        Args: { p_cotacao_id: string; p_user_id: string }
        Returns: boolean
      }
      finalizar_nova_cotacao_notification: {
        Args: { p_cotacao_id: string; p_sucesso: boolean; p_user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      marcar_em_analise: { Args: { _cotacao_id: string }; Returns: undefined }
      responder_cotacao: {
        Args: {
          p_condicoes_pagamento?: string
          p_cotacao_id: string
          p_endereco_entrega?: string
          p_frete?: string
          p_impostos?: string
          p_itens?: Json
          p_motivo_devolucao?: string
          p_prazo_entrega?: string
          p_proposta_mensagem?: string
          p_status_novo: Database["public"]["Enums"]["cotacao_status"]
          p_validade_orcamento_dias?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      change_request_status: "pendente" | "aprovada" | "rejeitada"
      cotacao_status: "enviado" | "em_analise" | "respondido" | "devolvido"
      empresa_status: "pendente_aprovacao" | "aprovada" | "rejeitada"
      notificacao_status: "pendente" | "enviado" | "falhou"
      notificacao_tipo: "respondido" | "devolvido"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "editor", "user"],
      change_request_status: ["pendente", "aprovada", "rejeitada"],
      cotacao_status: ["enviado", "em_analise", "respondido", "devolvido"],
      empresa_status: ["pendente_aprovacao", "aprovada", "rejeitada"],
      notificacao_status: ["pendente", "enviado", "falhou"],
      notificacao_tipo: ["respondido", "devolvido"],
    },
  },
} as const
