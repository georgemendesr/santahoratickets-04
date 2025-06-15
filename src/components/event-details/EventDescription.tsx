
import { Event } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface EventDescriptionProps {
  event: Event;
}

export function EventDescription({ event }: EventDescriptionProps) {
  return (
    <div className="space-y-6">
      {/* Event Description */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </CardContent>
      </Card>

      {/* Event Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Local do Evento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {event.location}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
