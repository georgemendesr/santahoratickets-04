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
      batches: {
        Row: {
          available_tickets: number
          batch_group: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_id: string
          id: string
          is_visible: boolean | null
          max_purchase: number | null
          min_purchase: number | null
          order_number: number
          price: number
          start_date: string
          status: string | null
          title: string
          total_tickets: number
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          available_tickets: number
          batch_group?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_id: string
          id?: string
          is_visible?: boolean | null
          max_purchase?: number | null
          min_purchase?: number | null
          order_number: number
          price: number
          start_date: string
          status?: string | null
          title: string
          total_tickets: number
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          available_tickets?: number
          batch_group?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_id?: string
          id?: string
          is_visible?: boolean | null
          max_purchase?: number | null
          min_purchase?: number | null
          order_number?: number
          price?: number
          start_date?: string
          status?: string | null
          title?: string
          total_tickets?: number
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          approved_tickets: number | null
          available_tickets: number
          average_ticket_price: number | null
          checked_in_count: number | null
          created_at: string
          date: string
          description: string
          form_fields_count: number | null
          gross_revenue: number | null
          id: string
          image: string
          location: string
          net_revenue: number | null
          pdv_count: number | null
          pending_orders: number | null
          pending_tickets: number | null
          price: number
          promo_codes_count: number | null
          refunded_tickets: number | null
          staff_count: number | null
          status: string | null
          time: string
          title: string
          total_checkins: number | null
          view_count: number | null
        }
        Insert: {
          approved_tickets?: number | null
          available_tickets: number
          average_ticket_price?: number | null
          checked_in_count?: number | null
          created_at?: string
          date: string
          description: string
          form_fields_count?: number | null
          gross_revenue?: number | null
          id?: string
          image: string
          location: string
          net_revenue?: number | null
          pdv_count?: number | null
          pending_orders?: number | null
          pending_tickets?: number | null
          price: number
          promo_codes_count?: number | null
          refunded_tickets?: number | null
          staff_count?: number | null
          status?: string | null
          time: string
          title: string
          total_checkins?: number | null
          view_count?: number | null
        }
        Update: {
          approved_tickets?: number | null
          available_tickets?: number
          average_ticket_price?: number | null
          checked_in_count?: number | null
          created_at?: string
          date?: string
          description?: string
          form_fields_count?: number | null
          gross_revenue?: number | null
          id?: string
          image?: string
          location?: string
          net_revenue?: number | null
          pdv_count?: number | null
          pending_orders?: number | null
          pending_tickets?: number | null
          price?: number
          promo_codes_count?: number | null
          refunded_tickets?: number | null
          staff_count?: number | null
          status?: string | null
          time?: string
          title?: string
          total_checkins?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      fidelity_points: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      fidelity_redemptions: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          points_used: number
          reward_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          points_used: number
          reward_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          points_used?: number
          reward_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fidelity_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "fidelity_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      fidelity_rewards: {
        Row: {
          active: boolean
          available_units: number | null
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          points_required: number
          total_units: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          available_units?: number | null
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          points_required: number
          total_units?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          available_units?: number | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points_required?: number
          total_units?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points_history: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          points: number
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_preferences: {
        Row: {
          attempts: number | null
          batch_id: string | null
          card_token: string | null
          created_at: string
          error_message: string | null
          event_id: string
          external_id: string | null
          id: string
          init_point: string
          installments: number | null
          last_attempt_at: string | null
          payment_method_id: string | null
          payment_type: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: string | null
          ticket_quantity: number
          total_amount: number
          user_id: string
        }
        Insert: {
          attempts?: number | null
          batch_id?: string | null
          card_token?: string | null
          created_at?: string
          error_message?: string | null
          event_id: string
          external_id?: string | null
          id?: string
          init_point: string
          installments?: number | null
          last_attempt_at?: string | null
          payment_method_id?: string | null
          payment_type?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string | null
          ticket_quantity: number
          total_amount: number
          user_id: string
        }
        Update: {
          attempts?: number | null
          batch_id?: string | null
          card_token?: string | null
          created_at?: string
          error_message?: string | null
          event_id?: string
          external_id?: string | null
          id?: string
          init_point?: string
          installments?: number | null
          last_attempt_at?: string | null
          payment_method_id?: string | null
          payment_type?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string | null
          ticket_quantity?: number
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_preferences_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_uses: {
        Row: {
          created_at: string
          event_id: string
          id: string
          referral_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          referral_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          referral_id?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          event_id: string
          id: string
          referrer_id: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          event_id: string
          id?: string
          referrer_id: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          event_id?: string
          id?: string
          referrer_id?: string
          used_count?: number
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          created_at: string
          id: string
          points_spent: number
          reward_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_spent: number
          reward_id: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_spent?: number
          reward_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          active: boolean | null
          created_at: string
          description: string
          id: string
          image: string | null
          points_required: number
          title: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description: string
          id?: string
          image?: string | null
          points_required: number
          title: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          points_required?: number
          title?: string
        }
        Relationships: []
      }
      saved_cards: {
        Row: {
          card_brand: string
          card_token: string
          created_at: string
          id: string
          last_four_digits: string
          user_id: string
        }
        Insert: {
          card_brand: string
          card_token: string
          created_at?: string
          id?: string
          last_four_digits: string
          user_id: string
        }
        Update: {
          card_brand?: string
          card_token?: string
          created_at?: string
          id?: string
          last_four_digits?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_participants: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          ticket_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          ticket_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          ticket_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          batch_id: string | null
          check_in_time: string | null
          checked_in_by: string | null
          created_at: string
          event_id: string
          id: string
          order_id: string | null
          participant_email: string | null
          participant_name: string | null
          purchase_date: string
          qr_code: string
          qr_code_background: string | null
          qr_code_foreground: string | null
          qr_code_logo: string | null
          qr_code_logo_size: number | null
          used: boolean
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          check_in_time?: string | null
          checked_in_by?: string | null
          created_at?: string
          event_id: string
          id?: string
          order_id?: string | null
          participant_email?: string | null
          participant_name?: string | null
          purchase_date?: string
          qr_code: string
          qr_code_background?: string | null
          qr_code_foreground?: string | null
          qr_code_logo?: string | null
          qr_code_logo_size?: number | null
          used?: boolean
          user_id: string
        }
        Update: {
          batch_id?: string | null
          check_in_time?: string | null
          checked_in_by?: string | null
          created_at?: string
          event_id?: string
          id?: string
          order_id?: string | null
          participant_email?: string | null
          participant_name?: string | null
          purchase_date?: string
          qr_code?: string
          qr_code_background?: string | null
          qr_code_foreground?: string | null
          qr_code_logo?: string | null
          qr_code_logo_size?: number | null
          used?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tickets_batch_id"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          loyalty_points: number
          name: string | null
          phone: string | null
        }
        Insert: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id: string
          loyalty_points?: number
          name?: string | null
          phone?: string | null
        }
        Update: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name?: string | null
          phone?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      current_user_has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      generate_unique_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_points_balance: {
        Args: { user_id_param: string }
        Returns: number
      }
      has_role: {
        Args: { user_id: string; role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      process_referral_reward: {
        Args: {
          p_referrer_id: string
          p_referred_id: string
          p_event_id: string
        }
        Returns: undefined
      }
      update_batch_tickets: {
        Args: { p_event_id: string; p_quantity: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const
