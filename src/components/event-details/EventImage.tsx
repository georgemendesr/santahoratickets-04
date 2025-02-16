
import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

interface EventImageProps {
  src: string;
  alt: string;
}

export function EventImage({ src, alt }: EventImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(src);

  useEffect(() => {
    const getPublicUrl = async () => {
      // Se a URL já é completa, não precisa processar
      if (src.startsWith('http')) {
        console.log('URL completa:', src);
        setImageUrl(src);
        return;
      }

      try {
        console.log('Tentando obter URL pública para:', src);
        const { data } = supabase.storage
          .from('event-images')
          .getPublicUrl(src);

        if (data?.publicUrl) {
          console.log('URL pública obtida:', data.publicUrl);
          setImageUrl(data.publicUrl);
        } else {
          console.error('Não foi possível obter URL pública para:', src);
          setImageUrl('/placeholder.svg');
        }
      } catch (error) {
        console.error('Erro ao obter URL pública:', error);
        setImageUrl('/placeholder.svg');
      }
    };

    getPublicUrl();
  }, [src]);

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
          onError={(e) => {
            console.error('Erro ao carregar imagem:', imageUrl);
            e.currentTarget.src = '/placeholder.svg';
          }}
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
            onError={(e) => {
              console.error('Erro ao carregar imagem:', imageUrl);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
