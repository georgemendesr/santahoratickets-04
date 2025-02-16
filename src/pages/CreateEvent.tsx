
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EventForm, type EventFormData } from "@/components/EventForm";

const CreateEvent = () => {
  const navigate = useNavigate();

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData & { image: string }) => {
      const { error } = await supabase.from("events").insert([
        {
          ...data,
          price: parseFloat(data.price),
          available_tickets: parseInt(data.available_tickets),
          status: "published",
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      navigate("/");
    },
    onError: (error) => {
      toast.error("Erro ao criar evento");
      console.error("Erro:", error);
    },
  });

  const onSubmit = async (data: EventFormData) => {
    const imageInput = document.getElementById("image") as HTMLInputElement;
    const imageFile = imageInput.files?.[0];

    if (!imageFile) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    try {
      // Upload da imagem
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(`${Date.now()}-${imageFile.name}`, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("event-images")
        .getPublicUrl(uploadData.path);

      // Create event with image URL
      await createEventMutation.mutateAsync({
        ...data,
        image: publicUrl,
      });
    } catch (error) {
      toast.error("Erro ao fazer upload da imagem");
      console.error("Erro:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Criar Novo Evento</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <EventForm
            onSubmit={onSubmit}
            isSubmitting={createEventMutation.isPending}
            submitText={createEventMutation.isPending ? "Criando evento..." : "Criar Evento"}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
