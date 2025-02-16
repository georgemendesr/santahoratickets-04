
import { supabase } from "@/lib/supabase";

const testEvents = [
  {
    title: "Show do Metallica",
    description: "O maior show de metal de todos os tempos está de volta! Com uma produção impressionante e um setlist que promete agradar fãs de todas as épocas, o Metallica retorna ao Brasil para uma apresentação histórica.",
    date: "2024-05-15",
    time: "20:00",
    location: "Allianz Parque, São Paulo",
    price: 850.00,
    available_tickets: 15,
    image: "/placeholder.svg",
    status: "published"
  },
  {
    title: "Festival de Jazz",
    description: "Uma noite mágica com os melhores músicos de jazz do país. Apresentações especiais, jam sessions e muito mais em um ambiente acolhedor e sofisticado.",
    date: "2024-04-20",
    time: "19:00",
    location: "Teatro Municipal, Rio de Janeiro",
    price: 180.00,
    available_tickets: 150,
    image: "/placeholder.svg",
    status: "published"
  },
  {
    title: "Stand Up Comedy Night",
    description: "Uma noite de muitas risadas com os melhores comediantes do momento. Show especial com participação de convidados surpresa!",
    date: "2024-03-30",
    time: "21:00",
    location: "Comedy Club, Curitiba",
    price: 90.00,
    available_tickets: 8,
    image: "/placeholder.svg",
    status: "published"
  },
  {
    title: "Workshop de Fotografia",
    description: "Aprenda técnicas avançadas de fotografia com profissionais renomados. Workshop prático com equipamentos profissionais disponíveis para uso.",
    date: "2024-06-10",
    time: "09:00",
    location: "Studio Pro, São Paulo",
    price: 450.00,
    available_tickets: 25,
    image: "/placeholder.svg",
    status: "draft"
  },
  {
    title: "Festival de Cerveja Artesanal",
    description: "Degustação das melhores cervejarias artesanais do Brasil. Mais de 50 rótulos diferentes, food trucks e música ao vivo.",
    date: "2024-07-15",
    time: "14:00",
    location: "Expo Center, Belo Horizonte",
    price: 120.00,
    available_tickets: 5,
    image: "/placeholder.svg",
    status: "published"
  }
];

export const seedTestEvents = async () => {
  try {
    // Primeiro, vamos verificar se já existem eventos
    const { data: existingEvents } = await supabase
      .from('events')
      .select('*');

    console.log('Eventos existentes:', existingEvents);

    // Se não houver eventos, inserimos os dados de teste
    if (!existingEvents || existingEvents.length === 0) {
      const { data, error } = await supabase
        .from('events')
        .insert(testEvents)
        .select();

      if (error) {
        console.error('Erro ao inserir eventos de teste:', error);
        throw error;
      }

      if (data && data[0]) {
        const channel = supabase.channel('events-channel');
        await channel.subscribe();
        
        setTimeout(() => {
          channel.send({
            type: 'broadcast',
            event: 'ticket-purchase',
            payload: {
              eventId: data[0].id,
              quantity: 3
            }
          });
        }, 10000);
      }

      console.log('Eventos de teste inseridos com sucesso!');
      console.log('Dados inseridos:', data);
      
      return data;
    } else {
      console.log('Já existem eventos no banco de dados.');
      return existingEvents;
    }

  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};
