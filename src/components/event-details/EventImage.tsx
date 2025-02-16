
import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface EventImageProps {
  src: string;
  alt: string;
}

export function EventImage({ src, alt }: EventImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const placeholderUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80";

  // Usa o caminho exatamente como está no src
  const { data } = supabase.storage
    .from('event-images')
    .getPublicUrl(src);

  const imageUrl = data?.publicUrl;
  console.log('EventImage - src:', src);
  console.log('EventImage - URL gerada:', imageUrl);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="relative group cursor-zoom-in overflow-hidden rounded-xl shadow-lg"
      >
        <img
          src={imageUrl || placeholderUrl}
          alt={alt}
          className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            console.error('Erro ao carregar imagem:', src);
            console.error('URL tentada:', imageUrl);
            e.currentTarget.src = placeholderUrl;
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <img
            src={imageUrl || placeholderUrl}
            alt={alt}
            className="w-full h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              console.error('Erro ao carregar imagem no modal:', src);
              console.error('URL tentada:', imageUrl);
              e.currentTarget.src = placeholderUrl;
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
