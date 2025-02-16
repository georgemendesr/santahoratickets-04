
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type Event } from "@/types";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, MapPin, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log('Iniciando consulta ao Supabase...');
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*');

        console.log('Resposta do Supabase:', { data, error });
        
        if (error) {
          console.error('Erro do Supabase:', error);
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error('Erro na consulta:', err);
        throw err;
      }
    },
    retry: 1,
  });

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        toast.error("Erro ao deletar evento: " + error.message);
        return;
      }

      toast.success("Evento deletado com sucesso!");
      refetch(); // Recarrega a lista de eventos
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error("Erro ao deletar evento");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Publicado</Badge>;
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      case "ended":
        return <Badge variant="destructive">Encerrado</Badge>;
      default:
        return <Badge variant="outline">Status desconhecido</Badge>;
    }
  };

  const formatDate = (date: string, time: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year} ${time}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const filteredEvents = events?.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && event.status === statusFilter;
  });

  const handleSeedTestData = async () => {
    try {
      console.log('Tentando inserir dados de teste...');
      const { error } = await supabase
        .from('events')
        .insert([
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
        ]);

      if (error) {
        console.error('Erro ao inserir:', error);
        throw error;
      }
      
      toast.success("Dados de teste inseridos com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error('Erro completo:', error);
      toast.error("Erro ao inserir dados de teste");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center">
          <img 
            src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
            alt="Santa Hora" 
            className="h-24 object-contain"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500">Erro ao carregar eventos: {error.message}</p>
          </div>
        )}

        <div className="mb-4">
          <Button
            variant="outline"
            onClick={handleSeedTestData}
            className="w-full md:w-auto"
          >
            Inserir Dados de Teste
          </Button>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold">Meus Eventos</h1>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar pelo nome do evento..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="ended">Encerrado</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => navigate("/validate")}>
                Validar Ingressos
              </Button>
              <Button onClick={() => navigate("/create-event")}>
                Criar Evento
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando eventos...
                    </TableCell>
                  </TableRow>
                ) : filteredEvents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum evento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        {getStatusBadge(event.status || 'published')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{formatDate(event.date, event.time)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatPrice(event.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/event/${event.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/edit-event/${event.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

