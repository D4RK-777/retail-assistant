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
      flex_chatbot_ai_training_sessions: {
        Row: {
          completed_at: string | null
          content_sources: Json | null
          created_at: string
          embedding_model: string | null
          error_message: string | null
          id: string
          knowledge_coverage: Json | null
          processed_content: number | null
          progress: number | null
          status: string
          total_content: number | null
          training_metrics: Json | null
          type: string
        }
        Insert: {
          completed_at?: string | null
          content_sources?: Json | null
          created_at?: string
          embedding_model?: string | null
          error_message?: string | null
          id?: string
          knowledge_coverage?: Json | null
          processed_content?: number | null
          progress?: number | null
          status?: string
          total_content?: number | null
          training_metrics?: Json | null
          type: string
        }
        Update: {
          completed_at?: string | null
          content_sources?: Json | null
          created_at?: string
          embedding_model?: string | null
          error_message?: string | null
          id?: string
          knowledge_coverage?: Json | null
          processed_content?: number | null
          progress?: number | null
          status?: string
          total_content?: number | null
          training_metrics?: Json | null
          type?: string
        }
        Relationships: []
      }
      flex_chatbot_content_chunks: {
        Row: {
          category: string | null
          chunk_index: number | null
          content: string | null
          content_type: string | null
          created_at: string
          embedding: string | null
          id: string
          importance_score: number | null
          knowledge_level: string | null
          last_updated: string | null
          source_context: Json | null
          source_id: string | null
          tags: string[] | null
          title: string | null
          token_count: number | null
          url: string | null
        }
        Insert: {
          category?: string | null
          chunk_index?: number | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          importance_score?: number | null
          knowledge_level?: string | null
          last_updated?: string | null
          source_context?: Json | null
          source_id?: string | null
          tags?: string[] | null
          title?: string | null
          token_count?: number | null
          url?: string | null
        }
        Update: {
          category?: string | null
          chunk_index?: number | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          importance_score?: number | null
          knowledge_level?: string | null
          last_updated?: string | null
          source_context?: Json | null
          source_id?: string | null
          tags?: string[] | null
          title?: string | null
          token_count?: number | null
          url?: string | null
        }
        Relationships: []
      }
      flex_chatbot_scraped_pages: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          id: string
          links: string[] | null
          scraped_at: string
          title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          links?: string[] | null
          scraped_at?: string
          title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          links?: string[] | null
          scraped_at?: string
          title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      flex_chatbot_uploaded_files: {
        Row: {
          content: string | null
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          mime_type: string | null
          original_name: string
          storage_path: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          mime_type?: string | null
          original_name: string
          storage_path: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          storage_path?: string
          updated_at?: string
          uploaded_at?: string
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Simplified type definitions
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type CompositeTypes<T extends keyof Database['public']['CompositeTypes']> = Database['public']['CompositeTypes'][T]