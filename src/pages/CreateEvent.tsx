
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Upload } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  date: z.string().min(1, "A data é obrigatória"),
  time: z.string().min(1, "O horário é obrigatório"),
  location: z.string().min(1, "O local é obrigatório"),
  price: z.string().min(1, "O preço é obrigatório"),
  available_tickets: z.string().min(1, "A quantidade de ingressos é obrigatória"),
});

type FormData = z.infer<typeof schema>;

const CreateEvent = () => {
  const navigate = useNavigate();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      price: "",
      available_tickets: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: FormData & { image: string }) => {
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

  const onSubmit = async (data: FormData) => {
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o título do evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite a descrição do evento"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o local do evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço do ingresso</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="available_tickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de ingressos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? (
                  "Criando evento..."
                ) : (
                  "Criar Evento"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
