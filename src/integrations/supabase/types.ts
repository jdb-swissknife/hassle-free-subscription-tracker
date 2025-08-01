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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      early_adopter_signups: {
        Row: {
          created_at: string
          email: string | null
          id: string
          signup_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          signup_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          signup_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_default: boolean
          notification_type: string
          subject: string
          text_content: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_default?: boolean
          notification_type: string
          subject: string
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_default?: boolean
          notification_type?: string
          subject?: string
          text_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          email_data: Json | null
          error_message: string | null
          id: string
          max_attempts: number
          notification_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          channel?: string
          created_at?: string
          email_data?: Json | null
          error_message?: string | null
          id?: string
          max_attempts?: number
          notification_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          email_data?: Json | null
          error_message?: string | null
          id?: string
          max_attempts?: number
          notification_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          trial_used: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_used?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_used?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active: boolean
          cancelled_at: string | null
          category: string | null
          color: string | null
          created_at: string
          cycle: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          price: number
          provider: string
          start_date: string
          status: string | null
          trial_end_date: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          active?: boolean
          cancelled_at?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          cycle?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          price?: number
          provider: string
          start_date?: string
          status?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          active?: boolean
          cancelled_at?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          cycle?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          price?: number
          provider?: string
          start_date?: string
          status?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string
          default_notifications: Json
          email_notifications: boolean
          id: string
          in_app_notifications: boolean
          push_notifications: boolean
          theme: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          default_notifications?: Json
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          push_notifications?: boolean
          theme?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          default_notifications?: Json
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          push_notifications?: boolean
          theme?: string
          timezone?: string
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
      get_early_adopter_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_trial_info: {
        Args: { user_id: string }
        Returns: {
          trial_active: boolean
          trial_days_remaining: number
          trial_started_at: string
          trial_ends_at: string
        }[]
      }
      is_trial_active: {
        Args: { user_id: string }
        Returns: boolean
      }
      start_user_trial: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
