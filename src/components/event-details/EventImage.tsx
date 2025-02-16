
import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface EventImageProps {
  src: string;
  alt: string;
}

export function EventImage({ src, alt }: EventImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('/placeholder.svg');

  useEffect(() => {
    const getPublicUrl = async () => {
      try {
        // Verificar se é uma URL completa
        if (src.startsWith('http')) {
          console.log('Usando URL completa:', src);
          setImageUrl(src);
          return;
        }

        // Verificar se é um path do Supabase Storage
        if (src.includes('event-images/')) {
          console.log('Obtendo URL pública do Supabase para:', src);
          const { data } = supabase.storage
            .from('event-images')
            .getPublicUrl(src.replace('event-images/', ''));

          if (data?.publicUrl) {
            console.log('URL pública obtida:', data.publicUrl);
            setImageUrl(data.publicUrl);
            return;
          }
        }

        // Se chegou aqui, usa a URL como está (pode ser um path relativo local)
        console.log('Usando URL como está:', src);
        setImageUrl(src);
      } catch (error) {
        console.error('Erro ao processar URL da imagem:', error);
        setImageUrl('/placeholder.svg');
      }
    };

    if (src) {
      getPublicUrl();
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Erro ao carregar imagem:', e.currentTarget.src);
    if (e.currentTarget.src !== '/placeholder.svg') {
      e.currentTarget.src = '/placeholder.svg';
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="relative group cursor-zoom-in overflow-hidden rounded-xl shadow-lg"
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleError}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={handleError}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
