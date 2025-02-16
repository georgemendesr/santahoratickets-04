
import { supabase } from "@/integrations/supabase/client";

export async function uploadEventImage(file: File) {
  try {
    // Simplificar o nome do arquivo para facilitar debug
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    console.log('Tentando fazer upload:', fileName);
    
    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(fileName, file);

    if (error) {
      console.error('Erro no upload:', error);
      throw error;
    }

    console.log('Upload bem sucedido:', data);
    return fileName;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
}
