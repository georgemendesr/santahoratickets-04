
import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface EventPosterProps {
  imageUrl: string;
  title: string;
}

export function EventPoster({ imageUrl, title }: EventPosterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="relative group cursor-zoom-in overflow-hidden rounded-xl shadow-lg bg-gradient-to-br from-purple-500 to-pink-500"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Imagem não disponível</p>
            </div>
          </div>
        )}
        
        {imageUrl && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white animate-pulse" />
          </div>
        )}
      </div>

      {imageUrl && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
