
import { validateAuthToken, validateAdminRole } from '../../_shared/auth.ts';
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';

interface DashboardSummary {
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  activeEvents: number;
  checkedInTickets: number;
  pendingPayments: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('admin/dashboard-summary function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));
    await validateAdminRole(supabase, user.id);

    console.log('Fetching dashboard summary for admin:', user.id);

    // Buscar estatísticas em paralelo
    const [
      { count: totalEvents },
      { count: totalTickets },
      { data: revenueData },
      { count: activeEvents },
      { count: checkedInTickets },
      { count: pendingPayments }
    ] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('*', { count: 'exact', head: true }),
      supabase.from('payment_preferences')
        .select('total_amount')
        .eq('status', 'approved'),
      supabase.from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase.from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('used', true),
      supabase.from('payment_preferences')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
    ]);

    const totalRevenue = revenueData?.reduce((sum, payment) => 
      sum + Number(payment.total_amount), 0) || 0;

    const summary: DashboardSummary = {
      totalEvents: totalEvents || 0,
      totalTickets: totalTickets || 0,
      totalRevenue,
      activeEvents: activeEvents || 0,
      checkedInTickets: checkedInTickets || 0,
      pendingPayments: pendingPayments || 0
    };

    console.log('Dashboard summary generated:', summary);

    return successResponse(summary);

  } catch (error: any) {
    console.error('Error in dashboard-summary function:', error);
    return errorResponse(error.message || 'Erro ao buscar resumo do dashboard', 500);
  }
};

Deno.serve(handler);
