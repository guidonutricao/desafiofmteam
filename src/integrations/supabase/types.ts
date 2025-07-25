export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cards_resultado: {
        Row: {
          created_at: string
          descricao: string
          icone_url: string | null
          id: number
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao: string
          icone_url?: string | null
          id?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          icone_url?: string | null
          id?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      desafios_diarios: {
        Row: {
          atividade_fisica: boolean
          created_at: string
          data: string
          hidratacao: boolean
          id: number
          pontuacao_total: number
          registro_visual: boolean
          seguiu_dieta: boolean
          sono_qualidade: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          atividade_fisica?: boolean
          created_at?: string
          data: string
          hidratacao?: boolean
          id?: number
          pontuacao_total?: number
          registro_visual?: boolean
          seguiu_dieta?: boolean
          sono_qualidade?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          atividade_fisica?: boolean
          created_at?: string
          data?: string
          hidratacao?: boolean
          id?: number
          pontuacao_total?: number
          registro_visual?: boolean
          seguiu_dieta?: boolean
          sono_qualidade?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "desafios_diarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mensagens_motivacionais: {
        Row: {
          autor: string | null
          created_at: string
          id: number
          mensagem: string
          updated_at: string
        }
        Insert: {
          autor?: string | null
          created_at?: string
          id?: number
          mensagem: string
          updated_at?: string
        }
        Update: {
          autor?: string | null
          created_at?: string
          id?: number
          mensagem?: string
          updated_at?: string
        }
        Relationships: []
      }
      planos_dieta: {
        Row: {
          arquivo_url: string | null
          created_at: string
          descricao: string | null
          id: number
          is_vegetariano: boolean
          nome: string
          peso_max: number
          peso_min: number
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: number
          is_vegetariano?: boolean
          nome: string
          peso_max: number
          peso_min: number
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: number
          is_vegetariano?: boolean
          nome?: string
          peso_max?: number
          peso_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      planos_treino: {
        Row: {
          arquivo_url: string | null
          created_at: string
          descricao: string | null
          frequencia: number
          id: number
          nome: string
          tipo_treino: Database["public"]["Enums"]["tipo_treino_enum"]
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          frequencia: number
          id?: number
          nome: string
          tipo_treino: Database["public"]["Enums"]["tipo_treino_enum"]
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          frequencia?: number
          id?: number
          nome?: string
          tipo_treino?: Database["public"]["Enums"]["tipo_treino_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      pontuacoes: {
        Row: {
          created_at: string
          dias_consecutivos: number
          pontuacao_total: number
          ultima_data_participacao: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dias_consecutivos?: number
          pontuacao_total?: number
          ultima_data_participacao?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dias_consecutivos?: number
          pontuacao_total?: number
          ultima_data_participacao?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pontuacoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          foto_url: string | null
          nome: string
          peso_atual: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          foto_url?: string | null
          nome: string
          peso_atual?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          foto_url?: string | null
          nome?: string
          peso_atual?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tipo_treino_enum: "casa" | "academia" | "ar_livre" | "outro"
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
      tipo_treino_enum: ["casa", "academia", "ar_livre", "outro"],
    },
  },
} as const
