
import { useState, useEffect } from "react";
import { Participant } from "@/components/checkout/ParticipantForm";

export function useParticipants(quantity: number) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Initialize participants array when quantity changes
  useEffect(() => {
    const newParticipants = Array.from({ length: quantity }, (_, index) => 
      participants[index] || { name: "", email: "" }
    );
    setParticipants(newParticipants);
  }, [quantity]);

  const updateParticipants = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
  };

  const resetParticipants = () => {
    setParticipants(Array.from({ length: quantity }, () => ({ name: "", email: "" })));
  };

  return {
    participants,
    updateParticipants,
    resetParticipants
  };
}
