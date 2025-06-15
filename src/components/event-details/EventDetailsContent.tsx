
import { Event, Batch } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventInfo } from "./EventInfo";
import { EventActions } from "./EventActions";
import { BatchesTable } from "./BatchesTable";
import { LoyaltyCard } from "./LoyaltyCard";
import { ReferralCard } from "./ReferralCard";
import { EventImage } from "./EventImage";
import { Participant } from "@/components/checkout/ParticipantForm";

interface EventDetailsContentProps {
  event: Event;
  batches: Batch[];
  isAdmin: boolean;
  profile: any;
  referrer: { name: string } | null;
  referralCode: string | null;
  onShare: () => void;
  onPurchase: (batchId: string, quantity: number, participants: Participant[]) => void;
  onEdit: () => void;
  isPurchasing?: boolean;
}

export function EventDetailsContent({
  event,
  batches,
  isAdmin,
  profile,
  referrer,
  referralCode,
  onShare,
  onPurchase,
  onEdit,
  isPurchasing = false
}: EventDetailsContentProps) {
  const getLowStockAlert = (availableTickets: number) => {
    if (availableTickets <= 5 && availableTickets > 0) {
      return (
        <p className="text-sm text-yellow-600 font-medium">
          Últimas unidades disponíveis!
        </p>
      );
    }
    if (availableTickets === 0) {
      return (
        <p className="text-sm text-red-600 font-medium">
          Ingressos esgotados
        </p>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <EventImage src={event?.image} alt={event?.title} />
      </div>

      <div className="space-y-6">
        {referrer && (
          <Alert>
            <AlertDescription className="text-sm">
              Você está comprando através da indicação de usuário final {referrer.name}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <EventInfo event={event} getLowStockAlert={getLowStockAlert} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ingressos Disponíveis</h3>
            <BatchesTable 
              batches={batches || []} 
              onPurchase={onPurchase}
              isLoading={isPurchasing}
            />
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardContent className="p-6">
              <EventActions
                event={event}
                isAdmin={isAdmin}
                onPurchase={() => {}} // Admin não compra pelo frontend público
                onShare={onShare}
                onEdit={onEdit}
              />
            </CardContent>
          </Card>
        )}

        {profile && <LoyaltyCard points={profile.loyalty_points} />}

        {referralCode && <ReferralCard code={referralCode} />}
      </div>
    </div>
  );
}
