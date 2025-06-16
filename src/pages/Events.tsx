
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, MapPin, Users, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

const Events = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", isAdmin],
    queryFn: async () => {
      let query = supabase.from("events").select("*");
      
      // Para usuários comuns: apenas eventos ativos e futuros
      if (!isAdmin) {
        const today = new Date().toISOString().split('T')[0];
        query = query
          .eq("status", "active")
          .gte("date", today);
      }
      
      // Para admins: todos os eventos
      const { data, error } = await query.order("date", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: batches } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*");

      if (error) throw error;
      return data;
    }
  });

  // Filtrar eventos com base na busca e status (para admins)
  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!isAdmin) return matchesSearch;
    
    // Filtros para admin
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && event.status === "active";
    if (statusFilter === "draft") return matchesSearch && event.status === "draft";
    if (statusFilter === "ended") {
      const today = new Date().toISOString().split('T')[0];
      return matchesSearch && event.date < today;
    }
    
    return matchesSearch;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const getEventBatches = (eventId: string) => {
    return batches?.filter(batch => batch.event_id === eventId) || [];
  };

  const getMinPrice = (eventBatches: any[]) => {
    if (!eventBatches || eventBatches.length === 0) return 0;
    return Math.min(...eventBatches.map(batch => batch.price));
  };

  const getTotalTickets = (eventBatches: any[]) => {
    if (!eventBatches || eventBatches.length === 0) return 0;
    return eventBatches.reduce((total, batch) => total + batch.available_tickets, 0);
  };

  const getEventStatus = (event: any) => {
    const today = new Date().toISOString().split('T')[0];
    const eventBatches = getEventBatches(event.id);
    const totalTickets = getTotalTickets(eventBatches);
    
    if (event.date < today) return { label: "Encerrado", variant: "secondary" as const };
    if (totalTickets === 0) return { label: "Esgotado", variant: "destructive" as const };
    if (event.status === "draft") return { label: "Rascunho", variant: "outline" as const };
    return { label: "Disponível", variant: "default" as const };
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {isAdmin ? "Gerenciar Eventos" : "Eventos"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Gerencie todos os eventos da plataforma" : "Descubra os melhores eventos próximos a você"}
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={() => navigate("/eventos/criar")} className="w-full sm:w-auto touch-manipulation">
              <Plus className="mr-2 h-4 w-4" />
              Criar Evento
            </Button>
          )}
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos por nome, descrição ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3"
            />
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                  <SelectItem value="ended">Encerrados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Tente ajustar sua pesquisa." : "Não há eventos disponíveis no momento."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const eventBatches = getEventBatches(event.id);
              const minPrice = getMinPrice(eventBatches);
              const totalTickets = getTotalTickets(eventBatches);
              const status = getEventStatus(event);
              
              return (
                <Card 
                  key={event.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/evento/${event.id}`)}
                >
                  {event.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg sm:text-xl line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </CardTitle>
                      <Badge variant={status.variant} className="shrink-0">
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="truncate">{formatDate(event.date)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>{totalTickets} ingressos disponíveis</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {event.description && (
                      <CardDescription className="line-clamp-2 mb-4">
                        {event.description}
                      </CardDescription>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">A partir de</p>
                        <p className="text-lg sm:text-xl font-bold text-primary">
                          {formatPrice(minPrice)}
                        </p>
                      </div>
                      
                      <Button size="sm" className="touch-manipulation">
                        {isAdmin ? "Gerenciar" : "Ver Detalhes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Events;
