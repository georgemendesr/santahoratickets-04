
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const schema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  date: z.string().min(1, "A data é obrigatória"),
  time: z.string().min(1, "O horário é obrigatório"),
  location: z.string().min(1, "O local é obrigatório"),
  price: z.string().min(1, "O preço é obrigatório"),
  available_tickets: z.string().min(1, "A quantidade de ingressos é obrigatória"),
});

export type EventFormData = z.infer<typeof schema>;

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  defaultValues?: Partial<EventFormData>;
  isSubmitting?: boolean;
  submitText?: string;
  showImageField?: boolean;
  imageFieldHelperText?: string;
}

export const EventForm = ({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  submitText = "Criar Evento",
  showImageField = true,
  imageFieldHelperText,
}: EventFormProps) => {
  const form = useForm<EventFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      price: "",
      available_tickets: "",
    },
  });

  return (
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

        {showImageField && (
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
            {imageFieldHelperText && (
              <p className="text-sm text-muted-foreground">
                {imageFieldHelperText}
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processando..." : submitText}
        </Button>
      </form>
    </Form>
  );
};
