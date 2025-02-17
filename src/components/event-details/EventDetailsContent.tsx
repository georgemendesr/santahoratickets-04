
import { Event, Batch } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventInfo } from "./EventInfo";
import { EventActions } from "./EventActions";
import { BatchesTable } from "./BatchesTable";
import { LoyaltyCard } from "./LoyaltyCard";
import { ReferralCard } from "./ReferralCard";
import { EventImage } from "./EventImage";

interface EventDetailsContentProps {
  event: Event;
  batches: Batch[];
  isAdmin: boolean;
  profile: any;
  referrer: { name: string } | null;
  referralCode: string | null;
  onShare: () => void;
  onPurchase: () => void;
  onEdit: () => void;
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
  onEdit
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
      <div className="space-y-6">
        {referrer && (
          <Alert>
            <AlertDescription className="text-sm">
              Você está comprando através da indicação de usuário final {referrer.name}
            </AlertDescription>
          </Alert>
        )}

        <img 
          src="/lovable-uploads/c07e81e6-595c-4636-8fef-1f61c7240f65.png"
          alt="Capa do evento"
          className="w-full rounded-lg shadow-lg"
        />

        <Card>
          <CardContent className="p-6 space-y-4">
            <EventInfo event={event} getLowStockAlert={getLowStockAlert} />
          </CardContent>
        </Card>

        <BatchesTable batches={batches} />

        <Card>
          <CardContent className="p-6">
            <EventActions
              event={event}
              isAdmin={isAdmin}
              onPurchase={onPurchase}
              onShare={onShare}
              onEdit={onEdit}
            />
          </CardContent>
        </Card>

        {profile && <LoyaltyCard points={profile.loyalty_points} />}

        {referralCode && <ReferralCard code={referralCode} />}
      </div>
    </div>
  );
}
