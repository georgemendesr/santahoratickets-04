
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const successResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify({
      success: true,
      data
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
};

export const errorResponse = (message: string, status = 400, details?: any) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
};

export const handleCors = () => {
  return new Response(null, { headers: corsHeaders });
};
