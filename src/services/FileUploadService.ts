import { supabase } from "@/integrations/supabase/client";

export interface UploadedFile {
  id: string;
  file_name: string;
  original_name: string;
  file_size: number;
  file_type: string;
  mime_type?: string;
  storage_path: string;
  content?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface UploadResult {
  success: boolean;
  error?: string;
  file?: UploadedFile;
}

export class FileUploadService {
  static async uploadFile(file: File): Promise<UploadResult> {
    try {
      // Generate unique file name to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to Supabase storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (storageError) {
        console.error('Storage upload error:', storageError);
        return { success: false, error: 'Failed to upload file to storage' };
      }

      // Extract text content if it's a text file
      let content = '';
      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        try {
          content = await file.text();
        } catch (error) {
          console.warn('Could not extract text content:', error);
        }
      }

      // Save file metadata to database
      const { data: dbData, error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          file_name: fileName,
          original_name: file.name,
          file_size: file.size,
          file_type: fileExt || 'unknown',
          mime_type: file.type,
          storage_path: filePath,
          content: content || null
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up storage file if database insert fails
        await supabase.storage.from('documents').remove([filePath]);
        return { success: false, error: 'Failed to save file metadata' };
      }

      return { success: true, file: dbData };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Failed to upload file' };
    }
  }

  static async getUploadedFiles(): Promise<UploadedFile[]> {
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching uploaded files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      return [];
    }
  }

  static async deleteUploadedFile(id: string): Promise<boolean> {
    try {
      // First get the file info to delete from storage
      const { data: fileData, error: fetchError } = await supabase
        .from('uploaded_files')
        .select('storage_path')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching file for deletion:', fetchError);
        return false;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([fileData.storage_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  static async getFileUrl(storagePath: string): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }
}