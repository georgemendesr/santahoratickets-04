
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export async function createPaymentPreference(
  eventId: string,
  session: Session,
  batch: any,
  paymentType: string,
  paymentMethodId: string,
  cardToken?: string,
  installments?: number
) {
  const init_point = `${eventId}-${session.user.id}-${Date.now()}`;
  
  console.log("Criando preferência de pagamento:", {
    init_point,
    eventId,
    userId: session.user.id,
    amount: batch.price,
    paymentType,
    paymentMethodId,
    hasCardToken: !!cardToken,
    installments
  });
  
  const { data: preference, error } = await supabase
    .from("payment_preferences")
    .insert({
      init_point,
      event_id: eventId,
      user_id: session.user.id,
      ticket_quantity: 1,
      total_amount: batch.price,
      payment_type: paymentType,
      payment_method_id: paymentMethodId,
      card_token: cardToken,
      installments,
      status: "pending",
      attempts: 0,
      last_attempt_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar preferência:", error);
    throw error;
  }

  console.log("Preferência criada:", preference);
  return preference;
}
