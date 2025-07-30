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
      analytics: {
        Row: {
          analytics_id: string
          created_at: string | null
          event_data: Json | null
          event_type: string
          experience_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          analytics_id?: string
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          experience_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          analytics_id?: string
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          experience_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["experience_id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          experience_id: string
          id: string
          metadata: Json | null
          module_id: string | null
          module_type: string | null
          user_session_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          experience_id: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          module_type?: string | null
          user_session_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          experience_id?: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          module_type?: string | null
          user_session_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          app_name: string | null
          app_subtitle: string | null
          background_image: string | null
          created_at: string
          experience_id: string
          get_started_button_text: string | null
          id: string | null
          is_launched: boolean | null
          launch_url: string | null
          name: string
          qr_code_url: string | null
          status: string
          type: string | null
          updated_at: string
        }
        Insert: {
          app_name?: string | null
          app_subtitle?: string | null
          background_image?: string | null
          created_at?: string
          experience_id?: string
          get_started_button_text?: string | null
          id?: string | null
          is_launched?: boolean | null
          launch_url?: string | null
          name: string
          qr_code_url?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          app_name?: string | null
          app_subtitle?: string | null
          background_image?: string | null
          created_at?: string
          experience_id?: string
          get_started_button_text?: string | null
          id?: string | null
          is_launched?: boolean | null
          launch_url?: string | null
          name?: string
          qr_code_url?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fingerprints: {
        Row: {
          device_type: string | null
          fingerprint: Json
          fingerprintjs_fingerprint: Json | null
          fingerprintjs_uniqueness_score: number | null
          geolocation: Json | null
          id: number
          source: string | null
          thumbmark_data: Json | null
          thumbmark_fingerprint: Json | null
          thumbmark_uniqueness_score: number | null
          timestamp: string
          uniqueness_score: number
          url_id: number
        }
        Insert: {
          device_type?: string | null
          fingerprint: Json
          fingerprintjs_fingerprint?: Json | null
          fingerprintjs_uniqueness_score?: number | null
          geolocation?: Json | null
          id?: number
          source?: string | null
          thumbmark_data?: Json | null
          thumbmark_fingerprint?: Json | null
          thumbmark_uniqueness_score?: number | null
          timestamp?: string
          uniqueness_score: number
          url_id: number
        }
        Update: {
          device_type?: string | null
          fingerprint?: Json
          fingerprintjs_fingerprint?: Json | null
          fingerprintjs_uniqueness_score?: number | null
          geolocation?: Json | null
          id?: number
          source?: string | null
          thumbmark_data?: Json | null
          thumbmark_fingerprint?: Json | null
          thumbmark_uniqueness_score?: number | null
          timestamp?: string
          uniqueness_score?: number
          url_id?: number
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          field1: string | null
          field2: string | null
          field3: string | null
          id: string
          media_type: string | null
          message_type: string | null
          tone: string | null
          user_id: string | null
          your_text_or_idea: string | null
        }
        Insert: {
          created_at?: string
          field1?: string | null
          field2?: string | null
          field3?: string | null
          id?: string
          media_type?: string | null
          message_type?: string | null
          tone?: string | null
          user_id?: string | null
          your_text_or_idea?: string | null
        }
        Update: {
          created_at?: string
          field1?: string | null
          field2?: string | null
          field3?: string | null
          id?: string
          media_type?: string | null
          message_type?: string | null
          tone?: string | null
          user_id?: string | null
          your_text_or_idea?: string | null
        }
        Relationships: []
      }
      master_templates: {
        Row: {
          audit_timestamp: string | null
          character_count: number | null
          created_at: string | null
          formatted_text: string
          formatting_density: number | null
          formatting_types: Json | null
          id: string
          is_private: boolean | null
          is_public: boolean | null
          name: string | null
          original_text: string
          source: string | null
          template_id: string
          user_id: string | null
        }
        Insert: {
          audit_timestamp?: string | null
          character_count?: number | null
          created_at?: string | null
          formatted_text: string
          formatting_density?: number | null
          formatting_types?: Json | null
          id?: string
          is_private?: boolean | null
          is_public?: boolean | null
          name?: string | null
          original_text: string
          source?: string | null
          template_id: string
          user_id?: string | null
        }
        Update: {
          audit_timestamp?: string | null
          character_count?: number | null
          created_at?: string | null
          formatted_text?: string
          formatting_density?: number | null
          formatting_types?: Json | null
          id?: string
          is_private?: boolean | null
          is_public?: boolean | null
          name?: string | null
          original_text?: string
          source?: string | null
          template_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_public: boolean | null
          media_id: string
          metadata: Json | null
          mime_type: string | null
          path: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_public?: boolean | null
          media_id?: string
          metadata?: Json | null
          mime_type?: string | null
          path: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_public?: boolean | null
          media_id?: string
          metadata?: Json | null
          mime_type?: string | null
          path?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      message_actions: {
        Row: {
          action_type: string
          created_at: string | null
          feedback_metadata: Json | null
          id: string
          interaction_duration_ms: number | null
          interaction_path: Json | null
          message_content: string
          message_id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          feedback_metadata?: Json | null
          id?: string
          interaction_duration_ms?: number | null
          interaction_path?: Json | null
          message_content: string
          message_id: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          feedback_metadata?: Json | null
          id?: string
          interaction_duration_ms?: number | null
          interaction_path?: Json | null
          message_content?: string
          message_id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      message_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          formatting_analysis: Json | null
          id: string
          is_positive: boolean
          message_content: string
          message_id: string
          message_metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          formatting_analysis?: Json | null
          id?: string
          is_positive: boolean
          message_content: string
          message_id: string
          message_metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          formatting_analysis?: Json | null
          id?: string
          is_positive?: boolean
          message_content?: string
          message_id?: string
          message_metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      message_metadata: {
        Row: {
          created_at: string | null
          emoji_density: number | null
          formatting_density: number | null
          formatting_patterns: Json | null
          has_code_blocks: boolean | null
          has_emojis: boolean | null
          has_links: boolean | null
          id: string
          link_density: number | null
          message_id: string
          message_tone: string | null
          message_type: string | null
          readability_metrics: Json | null
          section_variation: Json | null
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          created_at?: string | null
          emoji_density?: number | null
          formatting_density?: number | null
          formatting_patterns?: Json | null
          has_code_blocks?: boolean | null
          has_emojis?: boolean | null
          has_links?: boolean | null
          id?: string
          link_density?: number | null
          message_id: string
          message_tone?: string | null
          message_type?: string | null
          readability_metrics?: Json | null
          section_variation?: Json | null
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          created_at?: string | null
          emoji_density?: number | null
          formatting_density?: number | null
          formatting_patterns?: Json | null
          has_code_blocks?: boolean | null
          has_emojis?: boolean | null
          has_links?: boolean | null
          id?: string
          link_density?: number | null
          message_id?: string
          message_tone?: string | null
          message_type?: string | null
          readability_metrics?: Json | null
          section_variation?: Json | null
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          content: Json | null
          created_at: string
          display_order: number
          experience_id: string
          module_id: string
          screen_id: string | null
          title: string
          type: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          display_order: number
          experience_id: string
          module_id?: string
          screen_id?: string | null
          title: string
          type: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          display_order?: number
          experience_id?: string
          module_id?: string
          screen_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["experience_id"]
          },
          {
            foreignKeyName: "modules_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["screen_id"]
          },
        ]
      }
      nods_page: {
        Row: {
          checksum: string | null
          id: number
          meta: Json | null
          parent_page_id: number | null
          path: string
          source: string | null
          type: string | null
        }
        Insert: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path: string
          source?: string | null
          type?: string | null
        }
        Update: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path?: string
          source?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page_section: {
        Row: {
          content: string | null
          embedding: string | null
          heading: string | null
          id: number
          page_id: number
          slug: string | null
          token_count: number | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id: number
          slug?: string | null
          token_count?: number | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id?: number
          slug?: string | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          access_count: number
          created_at: string
          experience_id: string
          last_accessed: string | null
          qr_code_id: string
          qr_image_url: string | null
        }
        Insert: {
          access_count?: number
          created_at?: string
          experience_id: string
          last_accessed?: string | null
          qr_code_id?: string
          qr_image_url?: string | null
        }
        Update: {
          access_count?: number
          created_at?: string
          experience_id?: string
          last_accessed?: string | null
          qr_code_id?: string
          qr_image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["experience_id"]
          },
        ]
      }
      screens: {
        Row: {
          background_media_id: string | null
          created_at: string | null
          experience_id: string
          screen_id: string
          screen_index: number
          updated_at: string | null
        }
        Insert: {
          background_media_id?: string | null
          created_at?: string | null
          experience_id: string
          screen_id?: string
          screen_index?: number
          updated_at?: string | null
        }
        Update: {
          background_media_id?: string | null
          created_at?: string | null
          experience_id?: string
          screen_id?: string
          screen_index?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screens_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["experience_id"]
          },
        ]
      }
      template_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          share_method: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          share_method?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          share_method?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          character_count: number
          created_at: string | null
          formatted_text: string
          formatting_density: number
          formatting_types: Json
          id: string
          is_private: boolean | null
          is_public: boolean | null
          media_type: string | null
          mediatype: string | null
          message_type: string | null
          messagetype: string | null
          name: string | null
          original_text: string
          tool: string | null
          tov: string | null
          user_id: string | null
        }
        Insert: {
          character_count: number
          created_at?: string | null
          formatted_text: string
          formatting_density: number
          formatting_types: Json
          id?: string
          is_private?: boolean | null
          is_public?: boolean | null
          media_type?: string | null
          mediatype?: string | null
          message_type?: string | null
          messagetype?: string | null
          name?: string | null
          original_text: string
          tool?: string | null
          tov?: string | null
          user_id?: string | null
        }
        Update: {
          character_count?: number
          created_at?: string | null
          formatted_text?: string
          formatting_density?: number
          formatting_types?: Json
          id?: string
          is_private?: boolean | null
          is_public?: boolean | null
          media_type?: string | null
          mediatype?: string | null
          message_type?: string | null
          messagetype?: string | null
          name?: string | null
          original_text?: string
          tool?: string | null
          tov?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      urls: {
        Row: {
          analytics: Json
          created_at: string
          detection_method: string
          device_urls: Json
          id: number
          link_name: string
          slug: string
          visit_count: number
        }
        Insert: {
          analytics: Json
          created_at?: string
          detection_method: string
          device_urls: Json
          id?: number
          link_name?: string
          slug: string
          visit_count?: number
        }
        Update: {
          analytics?: Json
          created_at?: string
          detection_method?: string
          device_urls?: Json
          id?: number
          link_name?: string
          slug?: string
          visit_count?: number
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string | null
          id: string
          profile_photo_url: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          profile_photo_url?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          profile_photo_url?: string | null
        }
        Relationships: []
      }
      visits: {
        Row: {
          access_method: string
          browser: string | null
          city: string | null
          country_code: string | null
          device_category: string
          fingerprint_id: number | null
          id: number
          latitude: number | null
          longitude: number | null
          os: string | null
          redirect_url: string
          region: string | null
          timestamp: string
          url_id: number
          user_agent: string | null
          viewport_height: number
          viewport_width: number
        }
        Insert: {
          access_method?: string
          browser?: string | null
          city?: string | null
          country_code?: string | null
          device_category: string
          fingerprint_id?: number | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          redirect_url: string
          region?: string | null
          timestamp?: string
          url_id: number
          user_agent?: string | null
          viewport_height: number
          viewport_width: number
        }
        Update: {
          access_method?: string
          browser?: string | null
          city?: string | null
          country_code?: string | null
          device_category?: string
          fingerprint_id?: number | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          redirect_url?: string
          region?: string | null
          timestamp?: string
          url_id?: number
          user_agent?: string | null
          viewport_height?: number
          viewport_width?: number
        }
        Relationships: [
          {
            foreignKeyName: "visits_fingerprint_id_fingerprints_id_fk"
            columns: ["fingerprint_id"]
            isOneToOne: false
            referencedRelation: "fingerprints"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_message_metrics: {
        Row: {
          action: string | null
          created_at: string
          field_name: string | null
          formatting_analysis: Json | null
          generated_length: number
          generated_message: string
          id: string
          media_type: string
          message_type: string
          original_length: number
          original_message: string
          tone_of_voice: string
          was_regenerated: boolean | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          field_name?: string | null
          formatting_analysis?: Json | null
          generated_length: number
          generated_message: string
          id?: string
          media_type: string
          message_type: string
          original_length: number
          original_message: string
          tone_of_voice: string
          was_regenerated?: boolean | null
        }
        Update: {
          action?: string | null
          created_at?: string
          field_name?: string | null
          formatting_analysis?: Json | null
          generated_length?: number
          generated_message?: string
          id?: string
          media_type?: string
          message_type?: string
          original_length?: number
          original_message?: string
          tone_of_voice?: string
          was_regenerated?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      message_analytics: {
        Row: {
          copy_count: number | null
          dislike_count: number | null
          has_code_blocks: boolean | null
          has_emojis: boolean | null
          has_links: boolean | null
          like_count: number | null
          message_created_at: string | null
          message_id: string | null
          message_tone: string | null
          message_type: string | null
          word_count: number | null
        }
        Insert: {
          copy_count?: never
          dislike_count?: never
          has_code_blocks?: boolean | null
          has_emojis?: boolean | null
          has_links?: boolean | null
          like_count?: never
          message_created_at?: string | null
          message_id?: string | null
          message_tone?: string | null
          message_type?: string | null
          word_count?: number | null
        }
        Update: {
          copy_count?: never
          dislike_count?: never
          has_code_blocks?: boolean | null
          has_emojis?: boolean | null
          has_links?: boolean | null
          like_count?: never
          message_created_at?: string | null
          message_id?: string | null
          message_tone?: string | null
          message_type?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      message_formatting_analysis: {
        Row: {
          avg_section_length: string | null
          copy_count: number | null
          dislike_count: number | null
          emoji_density: number | null
          formatting_density: number | null
          formatting_patterns: Json | null
          like_count: number | null
          link_density: number | null
          message_id: string | null
          message_tone: string | null
          message_type: string | null
          paragraph_count: string | null
          readability_score: string | null
          total_actions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_message_formatting: {
        Args: { p_message_id: string }
        Returns: Json
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_message_stats: {
        Args: { p_message_id: string }
        Returns: Json
      }
      get_page_parents: {
        Args: { page_id: number }
        Returns: {
          id: number
          parent_page_id: number
          path: string
          meta: Json
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_visit_count_by_id: {
        Args: { url_id: number }
        Returns: undefined
      }
      increment_visit_count_by_uuid: {
        Args: { url_id: string }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_page_sections: {
        Args: {
          embedding: string
          match_threshold: number
          match_count: number
          min_content_length: number
        }
        Returns: {
          id: number
          page_id: number
          slug: string
          heading: string
          content: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
