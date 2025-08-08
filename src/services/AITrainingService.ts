import { supabase } from "@/integrations/supabase/client";

export interface TrainingSession {
  id: string;
  type: "full" | "incremental";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  total_content: number;
  processed_content: number;
  created_at: Date;
  completed_at?: Date;
  error_message?: string;
}

export class AITrainingService {
  static async startTraining(sessionId: string, type: "full" | "incremental"): Promise<TrainingSession> {
    try {
      // Start processing content with the edge function
      const { data, error } = await supabase.functions.invoke('process-content', {
        body: { sessionId, type }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No response from edge function');
      }

      // Check if the response indicates failure
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      // Return the session object - it's now created in the database
      return {
        id: sessionId,
        type,
        status: 'processing',
        progress: 0,
        total_content: data?.totalPages || 0,
        processed_content: 0,
        created_at: new Date(),
      };

    } catch (error) {
      console.error('Training service error:', error);
      throw new Error(`Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTrainingSessions(): Promise<TrainingSession[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('ai_training_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch training sessions: ${error.message}`);
      }

      return sessions?.map(session => ({
        id: session.id,
        type: session.type as "full" | "incremental",
        status: session.status as "pending" | "processing" | "completed" | "failed",
        progress: session.progress || 0,
        total_content: session.total_content || 0,
        processed_content: session.processed_content || 0,
        created_at: new Date(session.created_at),
        completed_at: session.completed_at ? new Date(session.completed_at) : undefined,
        error_message: session.error_message || undefined,
      })) || [];
    } catch (error) {
      throw new Error(`Failed to fetch training sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getSessionProgress(sessionId: string): Promise<TrainingSession | null> {
    try {
      const { data: session, error } = await supabase
        .from('ai_training_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(`Failed to fetch session progress: ${error.message}`);
      }

      if (!session) return null;

      return {
        id: session.id,
        type: session.type as "full" | "incremental",
        status: session.status as "pending" | "processing" | "completed" | "failed",
        progress: session.progress || 0,
        total_content: session.total_content || 0,
        processed_content: session.processed_content || 0,
        created_at: new Date(session.created_at),
        completed_at: session.completed_at ? new Date(session.completed_at) : undefined,
        error_message: session.error_message || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to fetch session progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async searchContent(query: string): Promise<any[]> {
    try {
      // Search through enhanced content chunks with improved categorization
      const { data: chunks, error } = await supabase
        .from('content_chunks')
        .select('*')
        .textSearch('content', query, { type: 'websearch' })
        .order('importance_score', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('Text search failed, falling back to basic search:', error.message);
        
        // Fallback to simple content matching
        const { data: fallbackChunks, error: fallbackError } = await supabase
          .from('content_chunks')
          .select('*')
          .ilike('content', `%${query}%`)
          .order('importance_score', { ascending: false })
          .limit(10);

        if (fallbackError) {
          throw new Error(`Failed to search content: ${fallbackError.message}`);
        }

        return fallbackChunks || [];
      }

      return chunks || [];

    } catch (error) {
      throw new Error(`Failed to search content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}