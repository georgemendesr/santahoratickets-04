
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      console.log("[useAdminUsers] Fetching users and roles...");

      // First get user profiles (admins can see all)
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*");

      if (profilesError) {
        console.error("[useAdminUsers] Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Then get user roles (admins can see all)
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) {
        console.error("[useAdminUsers] Error fetching roles:", rolesError);
        throw rolesError;
      }

      // Combine the data
      const usersWithRoles = profiles.map((profile) => ({
        ...profile,
        role: roles.find((r) => r.user_id === profile.id)?.role || "user",
      }));

      console.log("[useAdminUsers] Combined data:", usersWithRoles);
      return usersWithRoles;
    },
  });
}

export function useAdminFinancialMetrics() {
  return useQuery({
    queryKey: ["admin-financial-metrics"],
    queryFn: async () => {
      console.log("[useAdminFinancialMetrics] Fetching financial data...");

      const { data: events, error } = await supabase
        .from("events")
        .select("id, title, date, gross_revenue, net_revenue, approved_tickets")
        .order("date", { ascending: false })
        .limit(10);

      if (error) {
        console.error("[useAdminFinancialMetrics] Error:", error);
        throw error;
      }

      console.log("[useAdminFinancialMetrics] Events data:", events);
      return events;
    },
  });
}

export function useAdminPaymentMetrics() {
  return useQuery({
    queryKey: ["admin-payment-metrics"],
    queryFn: async () => {
      console.log("[useAdminPaymentMetrics] Fetching payment data...");

      const { data, error } = await supabase
        .from("payment_preferences")
        .select("payment_type, status")
        .eq("status", "approved");

      if (error) {
        console.error("[useAdminPaymentMetrics] Error:", error);
        throw error;
      }

      const metrics = data.reduce((acc: any, curr) => {
        const type = curr.payment_type || "outros";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const result = Object.entries(metrics).map(([name, value]) => ({
        name,
        value,
      }));

      console.log("[useAdminPaymentMetrics] Payment metrics:", result);
      return result;
    },
  });
}

export function useAdminDailySales() {
  return useQuery({
    queryKey: ["admin-daily-sales"],
    queryFn: async () => {
      console.log("[useAdminDailySales] Fetching daily sales...");

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("payment_preferences")
        .select("created_at, total_amount")
        .eq("status", "approved")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (error) {
        console.error("[useAdminDailySales] Error:", error);
        throw error;
      }

      const salesByDay = data.reduce((acc: any, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
        acc[date] = (acc[date] || 0) + Number(curr.total_amount);
        return acc;
      }, {});

      const result = Object.entries(salesByDay).map(([date, amount]) => ({
        date,
        amount,
      }));

      console.log("[useAdminDailySales] Daily sales:", result);
      return result;
    },
  });
}
