
import { useState } from "react";
import { Dialog } from "@radix-ui/react-dialog";
import { Image as ImageIcon } from "lucide-react";

interface EventImageProps {
  src: string;
  alt: string;
}

export function EventImage({ src, alt }: EventImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="relative group cursor-zoom-in overflow-hidden rounded-xl shadow-lg"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setIsOpen(false)} />
        <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]">
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
        </div>
      </Dialog>
    </>
  );
}
