
import { supabase } from "@/integrations/supabase/client";

export async function uploadEventImage(file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    console.log('uploadEventImage - Iniciando upload:', {
      fileName,
      fileType: file.type,
      fileSize: file.size
    });
    
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(fileName, file);

    if (error) {
      console.error('uploadEventImage - Erro no upload:', error);
      throw error;
    }

    console.log('uploadEventImage - Upload bem sucedido:', {
      data,
      fileName,
      fullPath: data?.path
    });

    return fileName;
  } catch (error) {
    console.error('uploadEventImage - Erro ao fazer upload da imagem:', error);
    throw error;
  }
}
