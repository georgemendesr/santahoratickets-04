
import { useParams, useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ProfileDialog } from "@/components/event-details/ProfileDialog";
import { EventLayout } from "@/components/event-details/EventLayout";
import { EventDetailsContent } from "@/components/event-details/EventDetailsContent";
import { useEventDetails } from "@/hooks/useEventDetails";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  
  const {
    event,
    batches,
    profile,
    referrer,
    referralCode,
    showProfileDialog,
    setShowProfileDialog,
    cpf,
    setCpf,
    birthDate,
    setBirthDate,
    phone,
    setPhone,
    createProfileMutation,
    createReferralMutation,
    handlePurchase,
    isPurchasing,
    isLoading
  } = useEventDetails(id);

  const handleShare = async () => {
    if (!session) {
      toast.error("Faça login para compartilhar o evento");
      navigate('/auth');
      return;
    }

    if (!profile) {
      setShowProfileDialog(true);
      return;
    }

    createReferralMutation.mutate();
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProfileMutation.mutate();
  };

  const handleEdit = () => {
    if (!event?.id) return;
    navigate(`/edit/${event.id}`);
  };

  if (isLoading) {
    return (
      <EventLayout onBack={() => navigate(-1)}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-2">Carregando evento...</p>
        </div>
      </EventLayout>
    );
  }

  if (!event) {
    return (
      <EventLayout onBack={() => navigate(-1)}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Evento não encontrado</p>
        </div>
      </EventLayout>
    );
  }

  return (
    <EventLayout onBack={() => navigate(-1)}>
      <EventDetailsContent
        event={event}
        batches={batches || []}
        isAdmin={isAdmin}
        profile={profile}
        referrer={referrer}
        referralCode={referralCode}
        onShare={handleShare}
        onPurchase={handlePurchase}
        onEdit={handleEdit}
        isPurchasing={isPurchasing}
      />

      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        cpf={cpf}
        birthDate={birthDate}
        phone={phone}
        onCpfChange={setCpf}
        onBirthDateChange={setBirthDate}
        onPhoneChange={setPhone}
        onSubmit={handleProfileSubmit}
        isPending={createProfileMutation.isPending}
      />
    </EventLayout>
  );
};

export default EventDetails;
