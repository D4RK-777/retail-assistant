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
  static async startTraining(type: "full" | "incremental"): Promise<TrainingSession> {
    try {
      // For now, start processing with edge function directly
      // This simulates the training session creation
      const sessionId = crypto.randomUUID();
      
      // Start processing content in the background
      const { data, error } = await supabase.functions.invoke('process-content', {
        body: { sessionId, type }
      });

      if (error) {
        throw new Error(`Failed to start training: ${error.message}`);
      }

      // Return a basic training session object
      return {
        id: sessionId,
        type,
        status: 'processing',
        progress: 0,
        total_content: 0,
        processed_content: 0,
        created_at: new Date(),
      };

    } catch (error) {
      throw new Error(`Failed to start training: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTrainingSessions(): Promise<TrainingSession[]> {
    // For now, return empty array since we don't have the table yet
    // Once database tables are created, this will fetch real data
    return [];
  }

  static async getSessionProgress(sessionId: string): Promise<TrainingSession | null> {
    // For now, return null since we don't have the table yet
    // Once database tables are created, this will fetch real progress
    return null;
  }

  static async searchContent(query: string): Promise<any[]> {
    try {
      // For now, search through scraped pages directly
      const { data: pages, error } = await supabase
        .from('scraped_pages')
        .select('*')
        .ilike('content', `%${query}%`)
        .limit(10);

      if (error) {
        throw new Error(`Failed to search content: ${error.message}`);
      }

      return pages || [];

    } catch (error) {
      throw new Error(`Failed to search content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}