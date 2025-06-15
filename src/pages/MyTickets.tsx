import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Download, QrCode, Ticket, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import QRCode from "qrcode";

const MyTickets = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [session, loading, navigate]);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["my-tickets", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*");

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

  const getEventForTicket = (eventId: string) => {
    return events?.find(event => event.id === eventId);
  };

  const getBatchForTicket = (batchId?: string) => {
    if (!batchId) return null;
    return batches?.find(batch => batch.id === batchId);
  };

  const generateQRCode = async (qrCode: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(qrCode);
      return qrDataURL;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  const downloadTicket = async (ticket: any) => {
    const event = getEventForTicket(ticket.event_id);
    if (!event) return;

    const qrDataURL = await generateQRCode(ticket.qr_code);
    if (!qrDataURL) return;

    // Create a simple ticket PDF/image (simplified version)
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Event title
    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(event.title, canvas.width / 2, 50);

    // Event details
    ctx.font = "16px Arial";
    const eventDate = new Date(event.date).toLocaleDateString("pt-BR");
    ctx.fillText(eventDate, canvas.width / 2, 100);
    
    if (event.location) {
      ctx.fillText(event.location, canvas.width / 2, 130);
    }

    // QR Code
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, (canvas.width - 200) / 2, 200, 200, 200);
      
      // Ticket code
      ctx.font = "12px monospace";
      ctx.fillText(ticket.qr_code, canvas.width / 2, 450);
      
      // Download
      const link = document.createElement("a");
      link.download = `ingresso-${event.title}-${ticket.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImage.src = qrDataURL;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (ticket: any) => {
    if (ticket.check_in_time) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Utilizado</Badge>;
    }
    
    const event = getEventForTicket(ticket.event_id);
    if (!event) return <Badge variant="secondary">Evento não encontrado</Badge>;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (eventDate < now) {
      return <Badge variant="secondary">Expirado</Badge>;
    }
    
    return <Badge variant="default">Válido</Badge>;
  };

  if (loading || isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Meus Ingressos</h1>
            <p className="text-muted-foreground">Gerencie seus ingressos e faça o download</p>
          </div>
        </div>

        {!tickets || tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum ingresso encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não possui ingressos. Compre seu primeiro ingresso!
            </p>
            <Button onClick={() => navigate("/eventos")} className="touch-manipulation">
              Explorar Eventos
            </Button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {tickets.map((ticket) => {
              const event = getEventForTicket(ticket.event_id);
              const batch = getBatchForTicket(ticket.batch_id);
              
              if (!event) {
                return (
                  <Card key={ticket.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg text-muted-foreground">Evento não encontrado</CardTitle>
                    </CardHeader>
                  </Card>
                );
              }

              return (
                <Card key={ticket.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl mb-2">{event.title}</CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        {getStatusBadge(ticket)}
                        {batch && (
                          <Badge variant="outline" className="text-xs">
                            {batch.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Código do Ingresso</p>
                        <code className="block text-xs bg-muted p-2 rounded font-mono break-all">
                          {ticket.qr_code}
                        </code>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => downloadTicket(ticket)}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto touch-manipulation"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar Ingresso
                        </Button>
                        
                        <Button
                          onClick={() => {
                            generateQRCode(ticket.qr_code).then(qrDataURL => {
                              if (qrDataURL) {
                                const newWindow = window.open();
                                newWindow?.document.write(`
                                  <html>
                                    <head><title>QR Code - ${event.title}</title></head>
                                    <body style="margin:0; padding:20px; text-align:center; font-family:Arial;">
                                      <h2>${event.title}</h2>
                                      <img src="${qrDataURL}" style="max-width:300px;" />
                                      <p style="font-family:monospace; font-size:12px; word-break:break-all;">${ticket.qr_code}</p>
                                    </body>
                                  </html>
                                `);
                              }
                            });
                          }}
                          variant="ghost"
                          size="sm"
                          className="w-full sm:w-auto touch-manipulation"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Ver QR Code
                        </Button>
                      </div>
                    </div>

                    {ticket.check_in_time && (
                      <div className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg">
                        <strong>Check-in realizado:</strong> {formatDate(ticket.check_in_time)}
                      </div>
                    )}
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

export default MyTickets;
