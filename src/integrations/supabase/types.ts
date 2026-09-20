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
      action_participations: {
        Row: {
          created_at: string
          id: string
          qr_code: string | null
          qr_used_at: string | null
          registration_ip: string | null
          session_id: string
          status: string
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          qr_code?: string | null
          qr_used_at?: string | null
          registration_ip?: string | null
          session_id: string
          status?: string
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          qr_code?: string | null
          qr_used_at?: string | null
          registration_ip?: string | null
          session_id?: string
          status?: string
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_participations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "action_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      action_sessions: {
        Row: {
          action_id: string
          capacity: number
          created_at: string
          ends_at: string | null
          id: string
          location: string | null
          qr_ttl_seconds: number
          registered_count: number
          starts_at: string
        }
        Insert: {
          action_id: string
          capacity?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          location?: string | null
          qr_ttl_seconds?: number
          registered_count?: number
          starts_at: string
        }
        Update: {
          action_id?: string
          capacity?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          location?: string | null
          qr_ttl_seconds?: number
          registered_count?: number
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_sessions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "sustainable_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          alt_text: string | null
          booking_enabled: boolean
          cancellation_policy: string | null
          carbon_impact: number | null
          catalogue_number: number | null
          category: string | null
          cover_image_path: string | null
          created_at: string
          currency: string | null
          description: string | null
          destination_id: string | null
          duration_hours: number | null
          duration_minutes: number | null
          eco_certified: boolean | null
          excluded: Json
          featured: boolean
          gallery: Json
          id: string
          image_url: string | null
          included: Json
          islands: string[]
          locations: string[]
          long_description: string | null
          max_capacity: number | null
          meeting_point: string | null
          min_capacity: number | null
          minimum_age: number | null
          name: string
          options: Json
          physical_level: string | null
          price: number | null
          provider_id: string | null
          slug: string | null
          sort_order: number | null
          tags: string[]
          universe_id: string | null
        }
        Insert: {
          alt_text?: string | null
          booking_enabled?: boolean
          cancellation_policy?: string | null
          carbon_impact?: number | null
          catalogue_number?: number | null
          category?: string | null
          cover_image_path?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          destination_id?: string | null
          duration_hours?: number | null
          duration_minutes?: number | null
          eco_certified?: boolean | null
          excluded?: Json
          featured?: boolean
          gallery?: Json
          id?: string
          image_url?: string | null
          included?: Json
          islands?: string[]
          locations?: string[]
          long_description?: string | null
          max_capacity?: number | null
          meeting_point?: string | null
          min_capacity?: number | null
          minimum_age?: number | null
          name: string
          options?: Json
          physical_level?: string | null
          price?: number | null
          provider_id?: string | null
          slug?: string | null
          sort_order?: number | null
          tags?: string[]
          universe_id?: string | null
        }
        Update: {
          alt_text?: string | null
          booking_enabled?: boolean
          cancellation_policy?: string | null
          carbon_impact?: number | null
          catalogue_number?: number | null
          category?: string | null
          cover_image_path?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          destination_id?: string | null
          duration_hours?: number | null
          duration_minutes?: number | null
          eco_certified?: boolean | null
          excluded?: Json
          featured?: boolean
          gallery?: Json
          id?: string
          image_url?: string | null
          included?: Json
          islands?: string[]
          locations?: string[]
          long_description?: string | null
          max_capacity?: number | null
          meeting_point?: string | null
          min_capacity?: number | null
          minimum_age?: number | null
          name?: string
          options?: Json
          physical_level?: string | null
          price?: number | null
          provider_id?: string | null
          slug?: string | null
          sort_order?: number | null
          tags?: string[]
          universe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_benefits: {
        Row: {
          created_at: string
          id: string
          label: string
          published: boolean
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          published?: boolean
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          published?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      ambassadors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          carbon_saved: number
          countries_visited: number
          created_at: string
          followers_label: string
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          name: string
          published: boolean
          sort_order: number
          specialties: string[]
          title: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          carbon_saved?: number
          countries_visited?: number
          created_at?: string
          followers_label?: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          name: string
          published?: boolean
          sort_order?: number
          specialties?: string[]
          title?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          carbon_saved?: number
          countries_visited?: number
          created_at?: string
          followers_label?: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string
          published?: boolean
          sort_order?: number
          specialties?: string[]
          title?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          payload: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          payload?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          payload?: Json | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          image_url: string | null
          published: boolean
          published_at: string
          read_time_minutes: number
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          published?: boolean
          published_at?: string
          read_time_minutes?: number
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          published?: boolean
          published_at?: string
          read_time_minutes?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      carbon_footprint_history: {
        Row: {
          accommodation_carbon: number | null
          activities_carbon: number | null
          created_at: string
          date: string
          emission_factor_set_id: string | null
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
          emission_factor_set_id?: string | null
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
          emission_factor_set_id?: string | null
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
          {
            foreignKeyName: "carbon_footprint_history_emission_factor_set_id_fkey"
            columns: ["emission_factor_set_id"]
            isOneToOne: false
            referencedRelation: "emission_factor_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_info_cards: {
        Row: {
          created_at: string
          description: string | null
          icon_key: string
          id: string
          page_key: string
          published: boolean
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_key?: string
          id?: string
          page_key?: string
          published?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_key?: string
          id?: string
          page_key?: string
          published?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      cms_page_heroes: {
        Row: {
          badge_text: string | null
          cta_label: string | null
          cta_url: string | null
          description: string | null
          page_key: string
          pdf_url: string | null
          title: string
          title_highlight: string | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          page_key: string
          pdf_url?: string | null
          title: string
          title_highlight?: string | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          page_key?: string
          pdf_url?: string | null
          title?: string
          title_highlight?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_stat_cards: {
        Row: {
          change_label: string | null
          created_at: string
          icon_key: string
          id: string
          label: string
          page_key: string
          published: boolean
          sort_order: number
          value: string
        }
        Insert: {
          change_label?: string | null
          created_at?: string
          icon_key?: string
          id?: string
          label: string
          page_key: string
          published?: boolean
          sort_order?: number
          value: string
        }
        Update: {
          change_label?: string | null
          created_at?: string
          icon_key?: string
          id?: string
          label?: string
          page_key?: string
          published?: boolean
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      community_stories: {
        Row: {
          author_location: string | null
          author_name: string
          comments_count: number
          content: string
          created_at: string
          destination: string
          id: string
          image_url: string | null
          likes_count: number
          moderated_at: string | null
          moderated_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_location?: string | null
          author_name: string
          comments_count?: number
          content: string
          created_at?: string
          destination: string
          id?: string
          image_url?: string | null
          likes_count?: number
          moderated_at?: string | null
          moderated_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_location?: string | null
          author_name?: string
          comments_count?: number
          content?: string
          created_at?: string
          destination?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          moderated_at?: string | null
          moderated_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_story_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "community_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_story_likes: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "community_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
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
          show_in_hero: boolean
          show_on_home: boolean
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
          show_in_hero?: boolean
          show_on_home?: boolean
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
          show_in_hero?: boolean
          show_on_home?: boolean
          wifi_speed?: number | null
        }
        Relationships: []
      }
      donation_reversements: {
        Row: {
          amount: number
          batch_date: string
          created_at: string
          id: string
          ngo_id: string
          proof_url: string | null
        }
        Insert: {
          amount: number
          batch_date?: string
          created_at?: string
          id?: string
          ngo_id: string
          proof_url?: string | null
        }
        Update: {
          amount?: number
          batch_date?: string
          created_at?: string
          id?: string
          ngo_id?: string
          proof_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_reversements_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          co2_offset_kg: number | null
          confirmed_at: string | null
          created_at: string
          id: string
          ngo_id: string
          receipt_url: string | null
          reservation_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          co2_offset_kg?: number | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          ngo_id: string
          receipt_url?: string | null
          reservation_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          co2_offset_kg?: number | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          ngo_id?: string
          receipt_url?: string | null
          reservation_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      emission_factor_sets: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          published_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          published_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          published_at?: string | null
        }
        Relationships: []
      }
      emission_factors: {
        Row: {
          category: string
          id: string
          set_id: string
          subcategory: string
          unit: string
          valid_from: string
          valid_to: string | null
          value: number
        }
        Insert: {
          category: string
          id?: string
          set_id: string
          subcategory: string
          unit: string
          valid_from?: string
          valid_to?: string | null
          value: number
        }
        Update: {
          category?: string
          id?: string
          set_id?: string
          subcategory?: string
          unit?: string
          valid_from?: string
          valid_to?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "emission_factors_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "emission_factor_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees_count: number
          created_at: string
          description: string | null
          ends_at: string | null
          event_type: string
          id: string
          image_url: string | null
          is_online: boolean
          location: string | null
          published: boolean
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          attendees_count?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          is_online?: boolean
          location?: string | null
          published?: boolean
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          attendees_count?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          is_online?: boolean
          location?: string | null
          published?: boolean
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_cta: {
        Row: {
          badge_text: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          primary_label: string
          primary_url: string
          secondary_label: string
          secondary_url: string
          title: string
          trust_items: string[]
          updated_at: string
        }
        Insert: {
          badge_text?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          primary_label?: string
          primary_url?: string
          secondary_label?: string
          secondary_url?: string
          title?: string
          trust_items?: string[]
          updated_at?: string
        }
        Update: {
          badge_text?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          primary_label?: string
          primary_url?: string
          secondary_label?: string
          secondary_url?: string
          title?: string
          trust_items?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      impact_breakdown: {
        Row: {
          amount: string | null
          category: string
          created_at: string
          id: string
          percentage: number
          published: boolean
          sort_order: number
        }
        Insert: {
          amount?: string | null
          category: string
          created_at?: string
          id?: string
          percentage?: number
          published?: boolean
          sort_order?: number
        }
        Update: {
          amount?: string | null
          category?: string
          created_at?: string
          id?: string
          percentage?: number
          published?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      impact_quarters: {
        Row: {
          carbon: number
          created_at: string
          id: string
          published: boolean
          quarter: string
          revenue: number
          sort_order: number
          travelers: number
        }
        Insert: {
          carbon?: number
          created_at?: string
          id?: string
          published?: boolean
          quarter: string
          revenue?: number
          sort_order?: number
          travelers?: number
        }
        Update: {
          carbon?: number
          created_at?: string
          id?: string
          published?: boolean
          quarter?: string
          revenue?: number
          sort_order?: number
          travelers?: number
        }
        Relationships: []
      }
      inventory_holds: {
        Row: {
          cart_id: string | null
          created_at: string
          expires_at: string
          id: string
          quantity: number
          schedule_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          quantity?: number
          schedule_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          quantity?: number
          schedule_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_holds_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "offer_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          invoice_number: string
          lines: Json
          payment_id: string
          pdf_url: string | null
          reservation_id: string | null
          total: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_number: string
          lines?: Json
          payment_id: string
          pdf_url?: string | null
          reservation_id?: string | null
          total: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_number?: string
          lines?: Json
          payment_id?: string
          pdf_url?: string | null
          reservation_id?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_milestones: {
        Row: {
          created_at: string
          description: string | null
          event: string
          id: string
          published: boolean
          sort_order: number
          year: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event: string
          id?: string
          published?: boolean
          sort_order?: number
          year: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event?: string
          id?: string
          published?: boolean
          sort_order?: number
          year?: string
        }
        Relationships: []
      }
      mission_team: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          published: boolean
          role: string | null
          sort_order: number
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          published?: boolean
          role?: string | null
          sort_order?: number
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          published?: boolean
          role?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      mission_values: {
        Row: {
          created_at: string
          description: string | null
          icon_key: string
          id: string
          published: boolean
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_key?: string
          id?: string
          published?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_key?: string
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          acted_by: string
          action_type: string
          created_at: string
          id: string
          reason: string | null
          report_id: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          acted_by: string
          action_type: string
          created_at?: string
          id?: string
          reason?: string | null
          report_id?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          acted_by?: string
          action_type?: string
          created_at?: string
          id?: string
          reason?: string | null
          report_id?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
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
      ngos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          impact_label: string | null
          is_active: boolean
          logo_url: string | null
          mission: string | null
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          impact_label?: string | null
          is_active?: boolean
          logo_url?: string | null
          mission?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          impact_label?: string | null
          is_active?: boolean
          logo_url?: string | null
          mission?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          error: string | null
          id: string
          payload: Json
          recipient_email: string | null
          sent_at: string | null
          status: string
          subject: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          recipient_email?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          recipient_email?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      offer_schedules: {
        Row: {
          booked_count: number
          capacity: number
          created_at: string
          end_at: string
          id: string
          offer_id: string
          price_eur: number | null
          start_at: string
        }
        Insert: {
          booked_count?: number
          capacity?: number
          created_at?: string
          end_at: string
          id?: string
          offer_id: string
          price_eur?: number | null
          start_at: string
        }
        Update: {
          booked_count?: number
          capacity?: number
          created_at?: string
          end_at?: string
          id?: string
          offer_id?: string
          price_eur?: number | null
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_schedules_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string
          destination_id: string | null
          id: string
          name: string
          offer_type: string
        }
        Insert: {
          created_at?: string
          destination_id?: string | null
          id: string
          name: string
          offer_type: string
        }
        Update: {
          created_at?: string
          destination_id?: string | null
          id?: string
          name?: string
          offer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          company_name: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string | null
          partner_type: string
          status: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          partner_type?: string
          status?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          partner_type?: string
          status?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      partner_orgs: {
        Row: {
          category: string
          certifications: string[]
          certified: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          impact_label: string | null
          location: string | null
          locations_count: number | null
          name: string
          progress: number | null
          published: boolean
          sort_order: number
          specialty: string | null
          type: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category: string
          certifications?: string[]
          certified?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          impact_label?: string | null
          location?: string | null
          locations_count?: number | null
          name: string
          progress?: number | null
          published?: boolean
          sort_order?: number
          specialty?: string | null
          type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string
          certifications?: string[]
          certified?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          impact_label?: string | null
          location?: string | null
          locations_count?: number | null
          name?: string
          progress?: number | null
          published?: boolean
          sort_order?: number
          specialty?: string | null
          type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          reservation_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          reservation_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          reservation_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned_at: string | null
          banned_reason: string | null
          bio: string | null
          carbon_preference: string | null
          created_at: string
          full_name: string | null
          id: string
          is_banned: boolean
          total_carbon_saved: number | null
          trips_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          carbon_preference?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_banned?: boolean
          total_carbon_saved?: number | null
          trips_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          carbon_preference?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_banned?: boolean
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
      providers: {
        Row: {
          created_at: string
          id: string
          name: string
          positioning: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          positioning?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          positioning?: string | null
          status?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          reason: string | null
          status: string
          stripe_refund_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          reason?: string | null
          status?: string
          stripe_refund_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          reason?: string | null
          status?: string
          stripe_refund_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          id: string
          received_at: string
          type: string
        }
        Insert: {
          id: string
          received_at?: string
          type: string
        }
        Update: {
          id?: string
          received_at?: string
          type?: string
        }
        Relationships: []
      }
      sustainable_actions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          reason: string
          reporter_user_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          reason: string
          reporter_user_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          reason?: string
          reporter_user_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_display_name: string | null
          comment: string | null
          created_at: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          rating: number
          status: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          author_display_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          rating: number
          status?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          author_display_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          rating?: number
          status?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      universes: {
        Row: {
          code: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string
          description?: string | null
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
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
      action_participation_ip_duplicates: {
        Row: {
          distinct_users: number | null
          registration_ip: string | null
          session_id: string | null
          user_ids: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      confirm_hold_without_payment: {
        Args: { p_hold_id: string }
        Returns: undefined
      }
      create_hold: {
        Args: { p_quantity?: number; p_schedule_id: string; p_ttl_seconds?: number }
        Returns: {
          cart_id: string | null
          created_at: string
          expires_at: string
          id: string
          quantity: number
          schedule_id: string
          status: string
          user_id: string | null
        }
      }
      expire_stale_holds: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      release_hold: {
        Args: { p_hold_id: string }
        Returns: undefined
      }
      register_for_action: {
        Args: { p_session_id: string }
        Returns: {
          created_at: string
          id: string
          qr_code: string | null
          qr_used_at: string | null
          session_id: string
          status: string
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
      }
      cancel_participation: {
        Args: { p_participation_id: string }
        Returns: undefined
      }
      validate_participation: {
        Args: { p_qr_code: string }
        Returns: {
          created_at: string
          id: string
          qr_code: string | null
          qr_used_at: string | null
          session_id: string
          status: string
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
      }
      is_banned: {
        Args: { _user_id: string }
        Returns: boolean
      }
      resolve_report: {
        Args: { p_action: string; p_reason?: string; p_report_id: string }
        Returns: undefined
      }
      unban_user: {
        Args: { p_reason?: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "organizer"
        | "partner_manager"
        | "support"
        | "finance"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "organizer",
        "partner_manager",
        "support",
        "finance",
      ],
    },
  },
} as const
