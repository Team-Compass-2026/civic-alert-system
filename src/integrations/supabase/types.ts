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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          advice: string | null
          area_id: string | null
          body: string
          created_at: string
          id: string
          kind: string
          lat: number | null
          level: Database["public"]["Enums"]["risk_level"]
          lng: number | null
          status: string
          title: string
        }
        Insert: {
          advice?: string | null
          area_id?: string | null
          body: string
          created_at?: string
          id?: string
          kind?: string
          lat?: number | null
          level: Database["public"]["Enums"]["risk_level"]
          lng?: number | null
          status?: string
          title: string
        }
        Update: {
          advice?: string | null
          area_id?: string | null
          body?: string
          created_at?: string
          id?: string
          kind?: string
          lat?: number | null
          level?: Database["public"]["Enums"]["risk_level"]
          lng?: number | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "v_area_risk"
            referencedColumns: ["area_id"]
          },
        ]
      }
      areas: {
        Row: {
          base_score: number
          baseline_at: string
          baseline_reports: number
          components: Json
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          radius_m: number
          slug: string
          township: string
          trend_pct: number
        }
        Insert: {
          base_score?: number
          baseline_at?: string
          baseline_reports?: number
          components?: Json
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
          radius_m?: number
          slug: string
          township: string
          trend_pct?: number
        }
        Update: {
          base_score?: number
          baseline_at?: string
          baseline_reports?: number
          components?: Json
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          radius_m?: number
          slug?: string
          township?: string
          trend_pct?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area_id: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "v_area_risk"
            referencedColumns: ["area_id"]
          },
        ]
      }
      reports: {
        Row: {
          anon_token: string | null
          area_id: string | null
          created_at: string
          description: string | null
          id: string
          is_anonymous: boolean
          lat: number
          lng: number
          photo_url: string | null
          status: string
          type: Database["public"]["Enums"]["report_type"]
          when_happened: string | null
        }
        Insert: {
          anon_token?: string | null
          area_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_anonymous?: boolean
          lat: number
          lng: number
          photo_url?: string | null
          status?: string
          type: Database["public"]["Enums"]["report_type"]
          when_happened?: string | null
        }
        Update: {
          anon_token?: string | null
          area_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_anonymous?: boolean
          lat?: number
          lng?: number
          photo_url?: string | null
          status?: string
          type?: Database["public"]["Enums"]["report_type"]
          when_happened?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "v_area_risk"
            referencedColumns: ["area_id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          area_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "v_area_risk"
            referencedColumns: ["area_id"]
          },
        ]
      }
      verifications: {
        Row: {
          anon_token: string
          created_at: string
          id: string
          report_id: string
          value: Database["public"]["Enums"]["verification_value"]
        }
        Insert: {
          anon_token: string
          created_at?: string
          id?: string
          report_id: string
          value: Database["public"]["Enums"]["verification_value"]
        }
        Update: {
          anon_token?: string
          created_at?: string
          id?: string
          report_id?: string
          value?: Database["public"]["Enums"]["verification_value"]
        }
        Relationships: [
          {
            foreignKeyName: "verifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "v_report_feed"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_alert_feed: {
        Row: {
          advice: string | null
          area_id: string | null
          area_name: string | null
          area_slug: string | null
          body: string | null
          created_at: string | null
          id: string | null
          kind: string | null
          lat: number | null
          level: Database["public"]["Enums"]["risk_level"] | null
          lng: number | null
          status: string | null
          title: string | null
          township: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "v_area_risk"
            referencedColumns: ["area_id"]
          },
        ]
      }
      v_area_risk: {
        Row: {
          area_id: string | null
          components: Json | null
          lat: number | null
          level: Database["public"]["Enums"]["risk_level"] | null
          lng: number | null
          name: string | null
          radius_m: number | null
          reports_this_week: number | null
          score: number | null
          slug: string | null
          township: string | null
          trend_pct: number | null
        }
        Relationships: []
      }
      v_report_feed: {
        Row: {
          area_id: string | null
          area_name: string | null
          confirms: number | null
          created_at: string | null
          description: string | null
          disputes: number | null
          id: string | null
          is_anonymous: boolean | null
          lat: number | null
          lng: number | null
          photo_url: string | null
          status: string | null
          type: Database["public"]["Enums"]["report_type"] | null
          when_happened: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "v_area_risk"
            referencedColumns: ["area_id"]
          },
        ]
      }
      v_signal_trends: {
        Row: {
          current_count: number | null
          previous_count: number | null
          trend_pct: number | null
          type: Database["public"]["Enums"]["report_type"] | null
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
      role_area_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "org" | "citizen"
      report_type:
        | "unsafe_water"
        | "sewage"
        | "flooding"
        | "broken_infrastructure"
        | "sanitation"
        | "illness_cluster"
        | "other"
      risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
      verification_value: "confirm" | "dispute"
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
      app_role: ["admin", "org", "citizen"],
      report_type: [
        "unsafe_water",
        "sewage",
        "flooding",
        "broken_infrastructure",
        "sanitation",
        "illness_cluster",
        "other",
      ],
      risk_level: ["LOW", "MODERATE", "HIGH", "CRITICAL"],
      verification_value: ["confirm", "dispute"],
    },
  },
} as const
