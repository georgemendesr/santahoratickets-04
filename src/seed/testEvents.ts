import { supabase } from "@/integrations/supabase/client";

const testEvents = [
  {
    title: "Show do Metallica",
    description: "O maior show de metal de todos os tempos está de volta!",
    date: "2024-05-15",
    time: "20:00",
    location: "Allianz Parque, São Paulo",
    price: 850.00,
    available_tickets: 15,
    image: "/placeholder.svg",
    status: "published"
  }
];

export const seedTestEvents = async () => {
  try {
    // Teste simples de conexão
    const { data: connectionTest, error: connectionError } = await supabase
      .from('events')
      .select('count')
      .single();

    if (connectionError) {
      console.error('Erro de conexão:', connectionError);
      throw connectionError;
    }

    console.log('Conexão bem sucedida:', connectionTest);

    // Se a conexão funcionar, tenta inserir apenas um evento
    const { data, error } = await supabase
      .from('events')
      .insert(testEvents)
      .select();

    if (error) {
      console.error('Erro ao inserir eventos:', error);
      throw error;
    }

    console.log('Evento inserido com sucesso:', data);
    return data;

  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};
