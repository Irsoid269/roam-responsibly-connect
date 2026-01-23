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
      accommodations: {
        Row: {
          amenities: string[] | null
          carbon_score: string | null
          created_at: string
          description: string | null
          destination_id: string
          distance_to_center: string | null
          id: string
          image_url: string | null
          name: string
          price_per_night: number | null
          rating: number | null
          type: string | null
        }
        Insert: {
          amenities?: string[] | null
          carbon_score?: string | null
          created_at?: string
          description?: string | null
          destination_id: string
          distance_to_center?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_per_night?: number | null
          rating?: number | null
          type?: string | null
        }
        Update: {
          amenities?: string[] | null
          carbon_score?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string
          distance_to_center?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_per_night?: number | null
          rating?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          carbon_impact: number | null
          category: string | null
          created_at: string
          description: string | null
          destination_id: string
          duration_hours: number | null
          eco_certified: boolean | null
          id: string
          image_url: string | null
          name: string
          price: number | null
        }
        Insert: {
          carbon_impact?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id: string
          duration_hours?: number | null
          eco_certified?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
        }
        Update: {
          carbon_impact?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string
          duration_hours?: number | null
          eco_certified?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_footprint_history: {
        Row: {
          accommodation_carbon: number | null
          activities_carbon: number | null
          created_at: string
          date: string
          id: string
          offset_amount: number | null
          reservation_id: string | null
          total_carbon: number | null
          transport_carbon: number | null
          user_id: string
        }
        Insert: {
          accommodation_carbon?: number | null
          activities_carbon?: number | null
          created_at?: string
          date?: string
          id?: string
          offset_amount?: number | null
          reservation_id?: string | null
          total_carbon?: number | null
          transport_carbon?: number | null
          user_id: string
        }
        Update: {
          accommodation_carbon?: number | null
          activities_carbon?: number | null
          created_at?: string
          date?: string
          id?: string
          offset_amount?: number | null
          reservation_id?: string | null
          total_carbon?: number | null
          transport_carbon?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_footprint_history_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      coworking_spaces: {
        Row: {
          address: string | null
          amenities: string[] | null
          carbon_score: string | null
          created_at: string
          description: string | null
          destination_id: string
          id: string
          image_url: string | null
          name: string
          opening_hours: string | null
          price_per_day: number | null
          price_per_hour: number | null
          price_per_month: number | null
          rating: number | null
          wifi_speed: number | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          carbon_score?: string | null
          created_at?: string
          description?: string | null
          destination_id: string
          id?: string
          image_url?: string | null
          name: string
          opening_hours?: string | null
          price_per_day?: number | null
          price_per_hour?: number | null
          price_per_month?: number | null
          rating?: number | null
          wifi_speed?: number | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          carbon_score?: string | null
          created_at?: string
          description?: string | null
          destination_id?: string
          id?: string
          image_url?: string | null
          name?: string
          opening_hours?: string | null
          price_per_day?: number | null
          price_per_hour?: number | null
          price_per_month?: number | null
          rating?: number | null
          wifi_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coworking_spaces_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          avg_price_per_day: number | null
          carbon_score: string | null
          city: string
          country: string
          coworking_count: number | null
          created_at: string
          description: string | null
          highlight: string | null
          id: string
          image_url: string | null
          name: string
          rating: number | null
          wifi_speed: number | null
        }
        Insert: {
          avg_price_per_day?: number | null
          carbon_score?: string | null
          city: string
          country: string
          coworking_count?: number | null
          created_at?: string
          description?: string | null
          highlight?: string | null
          id?: string
          image_url?: string | null
          name: string
          rating?: number | null
          wifi_speed?: number | null
        }
        Update: {
          avg_price_per_day?: number | null
          carbon_score?: string | null
          city?: string
          country?: string
          coworking_count?: number | null
          created_at?: string
          description?: string | null
          highlight?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rating?: number | null
          wifi_speed?: number | null
        }
        Relationships: []
      }
      mobility_options: {
        Row: {
          carbon_per_km: number | null
          created_at: string
          description: string | null
          destination_id: string
          id: string
          image_url: string | null
          name: string
          price_per_day: number | null
          price_per_hour: number | null
          type: string | null
        }
        Insert: {
          carbon_per_km?: number | null
          created_at?: string
          description?: string | null
          destination_id: string
          id?: string
          image_url?: string | null
          name: string
          price_per_day?: number | null
          price_per_hour?: number | null
          type?: string | null
        }
        Update: {
          carbon_per_km?: number | null
          created_at?: string
          description?: string | null
          destination_id?: string
          id?: string
          image_url?: string | null
          name?: string
          price_per_day?: number | null
          price_per_hour?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobility_options_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          carbon_preference: string | null
          created_at: string
          full_name: string | null
          id: string
          total_carbon_saved: number | null
          trips_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          carbon_preference?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          total_carbon_saved?: number | null
          trips_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          carbon_preference?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          total_carbon_saved?: number | null
          trips_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservation_items: {
        Row: {
          carbon_impact: number | null
          created_at: string
          end_date: string | null
          id: string
          item_id: string
          item_name: string
          item_type: string
          quantity: number | null
          reservation_id: string
          start_date: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          carbon_impact?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          item_id: string
          item_name: string
          item_type: string
          quantity?: number | null
          reservation_id: string
          start_date?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          carbon_impact?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          item_id?: string
          item_name?: string
          item_type?: string
          quantity?: number | null
          reservation_id?: string
          start_date?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_items_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          carbon_offset_purchased: boolean | null
          check_in_date: string
          check_out_date: string
          created_at: string
          destination_id: string | null
          id: string
          status: string | null
          total_carbon_impact: number | null
          total_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carbon_offset_purchased?: boolean | null
          check_in_date: string
          check_out_date: string
          created_at?: string
          destination_id?: string | null
          id?: string
          status?: string | null
          total_carbon_impact?: number | null
          total_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carbon_offset_purchased?: boolean | null
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          destination_id?: string | null
          id?: string
          status?: string | null
          total_carbon_impact?: number | null
          total_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          target_id?: string
          target_type?: string
          user_id?: string
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
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
