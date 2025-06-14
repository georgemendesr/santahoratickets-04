
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  senderName?: string;
  senderEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('send-email function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY not found');
      throw new Error('API key do Brevo não configurada');
    }

    const emailData: EmailRequest = await req.json();
    console.log('Email data received:', { to: emailData.to, subject: emailData.subject });

    const payload = {
      sender: {
        name: emailData.senderName || "Eventos",
        email: emailData.senderEmail || "noreply@eventos.com"
      },
      to: [
        {
          email: emailData.to,
          name: emailData.to.split('@')[0]
        }
      ],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent || emailData.htmlContent.replace(/<[^>]*>/g, '')
    };

    console.log('Sending email via Brevo API...');
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error:', response.status, errorText);
      throw new Error(`Erro da API Brevo: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Brevo:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.messageId,
        message: 'Email enviado com sucesso' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
