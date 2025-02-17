
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";

interface ImageUploadFieldProps {
  helperText?: string;
}

export const ImageUploadField = ({ helperText }: ImageUploadFieldProps) => {
  return (
    <div className="space-y-2">
      <FormLabel>Imagem do evento</FormLabel>
      <div className="flex items-center gap-4">
        <Input
          id="image"
          type="file"
          accept="image/*"
          className="cursor-pointer"
        />
      </div>
      {helperText && (
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};
