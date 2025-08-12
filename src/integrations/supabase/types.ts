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
      assistant_ai_training_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          organization_id: string | null
          processed_content: number | null
          progress: number | null
          status: string
          total_content: number | null
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          organization_id?: string | null
          processed_content?: number | null
          progress?: number | null
          status?: string
          total_content?: number | null
          type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          organization_id?: string | null
          processed_content?: number | null
          progress?: number | null
          status?: string
          total_content?: number | null
          type?: string
        }
        Relationships: []
      }
      assistant_content_chunks: {
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
          organization_id: string | null
          source_id: string | null
          source_url: string | null
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
          organization_id?: string | null
          source_id?: string | null
          source_url?: string | null
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
          organization_id?: string | null
          source_id?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string | null
          token_count?: number | null
          url?: string | null
        }
        Relationships: []
      }
      assistant_scraped_pages: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          id: string
          links: string[] | null
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
          scraped_at?: string
          title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      assistant_user_interactions: {
        Row: {
          ai_response: string | null
          context_used: string | null
          created_at: string
          id: string
          organization_id: string | null
          personality_used: string | null
          response_quality: number | null
          session_id: string | null
          user_message: string | null
        }
        Insert: {
          ai_response?: string | null
          context_used?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          personality_used?: string | null
          response_quality?: number | null
          session_id?: string | null
          user_message?: string | null
        }
        Update: {
          ai_response?: string | null
          context_used?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          personality_used?: string | null
          response_quality?: number | null
          session_id?: string | null
          user_message?: string | null
        }
        Relationships: []
      }
      assistants_organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          max_knowledge_items: number | null
          max_users: number | null
          name: string
          slug: string
          subscription_plan: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          max_knowledge_items?: number | null
          max_users?: number | null
          name: string
          slug: string
          subscription_plan?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          max_knowledge_items?: number | null
          max_users?: number | null
          name?: string
          slug?: string
          subscription_plan?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      assistants_organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string | null
          token?: string
        }
        Relationships: []
      }
      assistants_user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_sign_in_at: string | null
          organization_id: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          organization_id?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          organization_id?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
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

type PublicSchema = Database["public"]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
