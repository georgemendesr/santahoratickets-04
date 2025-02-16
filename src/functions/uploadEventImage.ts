
import { supabase } from "@/integrations/supabase/client";

export async function uploadEventImage(file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    return fileName;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
}
