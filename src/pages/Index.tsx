
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Calendar, Search, MapPin, Eye, Edit, Trash2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [recentPurchase, setRecentPurchase] = useState<{eventId: string, quantity: number} | null>(null);
  
  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log('Iniciando busca de eventos...');
      
      // Primeiro, vamos testar a conexão
      const { data: testData, error: testError } = await supabase
        .from('events')
        .select('count');
      
      if (testError) {
        console.error('Erro no teste de conexão:', testError);
        throw testError;
      }
      
      console.log('Teste de conexão bem sucedido:', testData);

      // Agora fazemos a query principal
      const { data, error } = await supabase
        .from('events')
        .select('*');
      
      if (error) {
        console.error('Erro na query principal:', error);
        throw error;
      }

      console.log('Eventos carregados com sucesso:', data);
      return data as Event[];
    },
  });

  useEffect(() => {
    const channel = supabase.channel('events-channel')
      .on('broadcast', { event: 'ticket-purchase' }, ({ payload }) => {
        setRecentPurchase(payload);
        setTimeout(() => setRecentPurchase(null), 5000); // Remove após 5 segundos
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Evento excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir evento");
      console.error("Erro:", error);
    },
  });

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este evento?")) {
      await deleteEventMutation.mutateAsync(eventId);
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

  const renderTicketAvailability = (event: Event) => {
    if (event.available_tickets <= 20) {
      return (
        <div className="flex items-center gap-2 text-amber-500 animate-pulse">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Poucas unidades</span>
        </div>
      );
    }
    return (
      <span className="text-muted-foreground">
        Em estoque
      </span>
    );
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
      const { seedTestEvents } = await import('@/seed/testEvents');
      await seedTestEvents();
      toast.success("Dados de teste inseridos com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao inserir dados de teste");
      console.error("Erro:", error);
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

        {recentPurchase && (
          <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-500 font-medium">
                Alguém acabou de comprar ingressos!
              </span>
              <Progress value={100} className="w-24 bg-green-500/20" />
            </div>
            <p className="text-sm text-muted-foreground">
              {recentPurchase.quantity} {recentPurchase.quantity === 1 ? 'ingresso foi comprado' : 'ingressos foram comprados'}. Não perca a sua chance!
            </p>
          </div>
        )}

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
                  <TableHead>Disponibilidade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Carregando eventos...
                    </TableCell>
                  </TableRow>
                ) : filteredEvents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhum evento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents?.map((event) => (
                    <TableRow 
                      key={event.id}
                      className={recentPurchase?.eventId === event.id ? "bg-green-500/5" : ""}
                    >
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
                        {renderTicketAvailability(event)}
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
