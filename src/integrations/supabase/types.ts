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
      blog_posts: {
        Row: {
          id: string
          title: string
          excerpt: string | null
          content: string | null
          image_url: string | null
          category: string
          author: string
          read_time_minutes: number
          featured: boolean
          published: boolean
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          excerpt?: string | null
          content?: string | null
          image_url?: string | null
          category?: string
          author?: string
          read_time_minutes?: number
          featured?: boolean
          published?: boolean
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string | null
          content?: string | null
          image_url?: string | null
          category?: string
          author?: string
          read_time_minutes?: number
          featured?: boolean
          published?: boolean
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          event_type: string
          location: string | null
          starts_at: string
          ends_at: string | null
          is_online: boolean
          attendees_count: number
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          event_type?: string
          location?: string | null
          starts_at: string
          ends_at?: string | null
          is_online?: boolean
          attendees_count?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          event_type?: string
          location?: string | null
          starts_at?: string
          ends_at?: string | null
          is_online?: boolean
          attendees_count?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          subject: string
          message: string
          status: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          subject?: string
          message: string
          status?: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          subject?: string
          message?: string
          status?: string
          user_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          company_name: string
          partner_type: string
          website: string | null
          message: string | null
          status: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          company_name: string
          partner_type: string
          website?: string | null
          message?: string | null
          status?: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          company_name?: string
          partner_type?: string
          website?: string | null
          message?: string | null
          status?: string
          user_id?: string | null
          created_at?: string
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
      ambassadors: {
        Row: {
          id: string
          name: string
          title: string | null
          location: string | null
          bio: string | null
          avatar_url: string | null
          carbon_saved: number
          countries_visited: number
          followers_label: string
          specialties: string[]
          instagram_url: string | null
          linkedin_url: string | null
          website_url: string | null
          sort_order: number
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          location?: string | null
          bio?: string | null
          avatar_url?: string | null
          carbon_saved?: number
          countries_visited?: number
          followers_label?: string
          specialties?: string[]
          instagram_url?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string | null
          location?: string | null
          bio?: string | null
          avatar_url?: string | null
          carbon_saved?: number
          countries_visited?: number
          followers_label?: string
          specialties?: string[]
          instagram_url?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ambassador_benefits: {
        Row: {
          id: string
          label: string
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          label: string
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          label?: string
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      community_story_likes: {
        Row: {
          id: string
          story_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      community_story_comments: {
        Row: {
          id: string
          story_id: string
          user_id: string
          author_name: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          author_name: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          author_name?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      cms_page_heroes: {
        Row: {
          page_key: string
          badge_text: string | null
          title: string
          title_highlight: string | null
          description: string | null
          cta_label: string | null
          cta_url: string | null
          pdf_url: string | null
          updated_at: string
        }
        Insert: {
          page_key: string
          badge_text?: string | null
          title: string
          title_highlight?: string | null
          description?: string | null
          cta_label?: string | null
          cta_url?: string | null
          pdf_url?: string | null
          updated_at?: string
        }
        Update: {
          page_key?: string
          badge_text?: string | null
          title?: string
          title_highlight?: string | null
          description?: string | null
          cta_label?: string | null
          cta_url?: string | null
          pdf_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_stat_cards: {
        Row: {
          id: string
          page_key: string
          label: string
          value: string
          change_label: string | null
          icon_key: string
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          page_key: string
          label: string
          value: string
          change_label?: string | null
          icon_key?: string
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          page_key?: string
          label?: string
          value?: string
          change_label?: string | null
          icon_key?: string
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      mission_values: {
        Row: {
          id: string
          icon_key: string
          title: string
          description: string | null
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          icon_key?: string
          title: string
          description?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          icon_key?: string
          title?: string
          description?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      mission_milestones: {
        Row: {
          id: string
          year: string
          event: string
          description: string | null
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          year: string
          event: string
          description?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          year?: string
          event?: string
          description?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      mission_team: {
        Row: {
          id: string
          name: string
          role: string | null
          bio: string | null
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role?: string | null
          bio?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string | null
          bio?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      partner_orgs: {
        Row: {
          id: string
          category: string
          name: string
          type: string | null
          location: string | null
          description: string | null
          impact_label: string | null
          progress: number | null
          image_url: string | null
          certified: boolean
          certifications: string[]
          specialty: string | null
          locations_count: number | null
          website_url: string | null
          sort_order: number
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          name: string
          type?: string | null
          location?: string | null
          description?: string | null
          impact_label?: string | null
          progress?: number | null
          image_url?: string | null
          certified?: boolean
          certifications?: string[]
          specialty?: string | null
          locations_count?: number | null
          website_url?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          name?: string
          type?: string | null
          location?: string | null
          description?: string | null
          impact_label?: string | null
          progress?: number | null
          image_url?: string | null
          certified?: boolean
          certifications?: string[]
          specialty?: string | null
          locations_count?: number | null
          website_url?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      impact_breakdown: {
        Row: {
          id: string
          category: string
          percentage: number
          amount: string | null
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          percentage?: number
          amount?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          percentage?: number
          amount?: string | null
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      impact_quarters: {
        Row: {
          id: string
          quarter: string
          travelers: number
          carbon: number
          revenue: number
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          quarter: string
          travelers?: number
          carbon?: number
          revenue?: number
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          quarter?: string
          travelers?: number
          carbon?: number
          revenue?: number
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      cms_info_cards: {
        Row: {
          id: string
          page_key: string
          title: string
          description: string | null
          icon_key: string
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          page_key?: string
          title: string
          description?: string | null
          icon_key?: string
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          page_key?: string
          title?: string
          description?: string | null
          icon_key?: string
          sort_order?: number
          published?: boolean
          created_at?: string
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
