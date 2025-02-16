
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
  const [imageUrl, setImageUrl] = useState<string>("");
  const placeholderUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80";

  useEffect(() => {
    if (src) {
      const url = supabase.storage
        .from('event-images')
        .getPublicUrl(src).data.publicUrl;
      setImageUrl(url);
    }
  }, [src]);

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
              e.currentTarget.src = placeholderUrl;
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
