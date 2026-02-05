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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      founder_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          related_user_id: string | null
          transaction_type: string
          withdrawal_network: string | null
          withdrawal_phone: string | null
          withdrawal_status: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_user_id?: string | null
          transaction_type: string
          withdrawal_network?: string | null
          withdrawal_phone?: string | null
          withdrawal_status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_user_id?: string | null
          transaction_type?: string
          withdrawal_network?: string | null
          withdrawal_phone?: string | null
          withdrawal_status?: string | null
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_cost: number
          redemptions_count: number | null
          sponsor_id: string | null
          stock_quantity: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_cost: number
          redemptions_count?: number | null
          sponsor_id?: string | null
          stock_quantity?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_cost?: number
          redemptions_count?: number | null
          sponsor_id?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          related_signalement_id: string | null
          related_sponsor_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          related_signalement_id?: string | null
          related_sponsor_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          related_signalement_id?: string | null
          related_sponsor_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_related_signalement_id_fkey"
            columns: ["related_signalement_id"]
            isOneToOne: false
            referencedRelation: "signalements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_related_sponsor_id_fkey"
            columns: ["related_sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nom: string
          prenoms: string
          telephone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          nom: string
          prenoms: string
          telephone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nom?: string
          prenoms?: string
          telephone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signalements: {
        Row: {
          arrondissement: string | null
          category: string
          commission_montant: number | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          montant_total: number | null
          nom_complet: string
          photo_url: string | null
          quartier: string | null
          secteur: string | null
          sous_quartier: string | null
          status: string
          statut_paiement: string
          subcategory: string
          updated_at: string
          user_id: string
          ville: string
        }
        Insert: {
          arrondissement?: string | null
          category: string
          commission_montant?: number | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          montant_total?: number | null
          nom_complet: string
          photo_url?: string | null
          quartier?: string | null
          secteur?: string | null
          sous_quartier?: string | null
          status?: string
          statut_paiement?: string
          subcategory: string
          updated_at?: string
          user_id: string
          ville: string
        }
        Update: {
          arrondissement?: string | null
          category?: string
          commission_montant?: number | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          montant_total?: number | null
          nom_complet?: string
          photo_url?: string | null
          quartier?: string | null
          secteur?: string | null
          sous_quartier?: string | null
          status?: string
          statut_paiement?: string
          subcategory?: string
          updated_at?: string
          user_id?: string
          ville?: string
        }
        Relationships: []
      }
      sponsor_ads: {
        Row: {
          action_label: string | null
          action_url: string | null
          banner_image_url: string | null
          clicks_count: number | null
          created_at: string
          description: string | null
          display_type: string | null
          end_date: string | null
          id: string
          impressions_count: number | null
          is_active: boolean | null
          priority: number | null
          sponsor_id: string
          start_date: string | null
          target_institutions: string[] | null
          title: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          banner_image_url?: string | null
          clicks_count?: number | null
          created_at?: string
          description?: string | null
          display_type?: string | null
          end_date?: string | null
          id?: string
          impressions_count?: number | null
          is_active?: boolean | null
          priority?: number | null
          sponsor_id: string
          start_date?: string | null
          target_institutions?: string[] | null
          title: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          banner_image_url?: string | null
          clicks_count?: number | null
          created_at?: string
          description?: string | null
          display_type?: string | null
          end_date?: string | null
          id?: string
          impressions_count?: number | null
          is_active?: boolean | null
          priority?: number | null
          sponsor_id?: string
          start_date?: string | null
          target_institutions?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_ads_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          advantage: string | null
          category: string
          code: string
          contact_email: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          monthly_fee: number | null
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          advantage?: string | null
          category: string
          code: string
          contact_email?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_fee?: number | null
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          advantage?: string | null
          category?: string
          code?: string
          contact_email?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_loyalty_points: {
        Row: {
          created_at: string
          id: string
          lifetime_earned: number
          lifetime_spent: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          institution: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          institution?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          institution?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      founder_balance: {
        Row: {
          current_balance: number | null
          total_commissions: number | null
          total_inscription_gains: number | null
          total_inscriptions: number | null
          total_withdrawn: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_founder: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "collector" | "admin" | "founder"
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
      app_role: ["user", "collector", "admin", "founder"],
    },
  },
} as const
