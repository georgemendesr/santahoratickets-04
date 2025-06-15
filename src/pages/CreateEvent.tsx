
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: ""
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session || !isAdmin) {
    navigate("/");
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implementar salvamento real no backend
      console.log("Dados do evento:", formData);
      console.log("Imagem:", imageFile);
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Evento criado com sucesso! Agora configure os lotes de ingressos.");
      
      // Simular redirecionamento para página de lotes do evento criado
      // navigate(`/admin/lotes?event=${eventId}`);
      navigate("/eventos");
    } catch (error) {
      toast.error("Erro ao criar evento");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/eventos")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Eventos
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Criar Evento</h1>
                <p className="text-muted-foreground">
                  Configure um novo evento. Após salvá-lo, você poderá configurar os lotes de ingressos.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Nome do Evento *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Digite o nome do evento"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o evento"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Data e Horário de Início *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                        <Input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Data e Horário de Término</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <Input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Local</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Local do evento"
                    />
                  </div>

                  <div>
                    <Label>Imagem do Evento (Cartaz) *</Label>
                    <div className="mt-2">
                      {!imagePreview ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <Label htmlFor="image-upload" className="cursor-pointer">
                              <span className="text-primary underline">Clique para enviar</span>
                              <span className="text-muted-foreground"> ou arraste e solte</span>
                            </Label>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            PNG, JPG, GIF até 10MB
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">📋 Próximo Passo</h4>
                    <p className="text-sm text-blue-700">
                      Após salvar o evento, você será redirecionado para configurar os <strong>lotes de ingressos</strong> 
                      onde poderá definir preços, quantidades e períodos de venda.
                    </p>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/eventos")}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.title || !formData.startDate || !formData.startTime}
                    >
                      {isSubmitting ? "Salvando..." : "Salvar e Configurar Lotes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
