import { supabase } from './supabase';

export const storageService = {
  async uploadImage(file: File, bucket: string = 'question-images'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  },

  async deleteImage(url: string, bucket: string = 'question-images'): Promise<void> {
    // Extract file path from URL
    const urlParts = url.split('/');
    const filePath = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  },
};
