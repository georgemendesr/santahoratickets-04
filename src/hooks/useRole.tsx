
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { UserRole } from "@/types";

export function useRole(session: Session | null) {
  const { data: role, isLoading: loading } = useQuery({
    queryKey: ["user-role", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) {
        console.log("[useRole] No session or user ID");
        return "user" as UserRole;
      }
      
      console.log("[useRole] Fetching role for user:", session.user.id);

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("[useRole] Error fetching user role:", error);
        return "user" as UserRole;
      }

      console.log("[useRole] User role data:", data);
      const userRole = (data?.role ?? "user") as UserRole;
      console.log("[useRole] Final role:", userRole);
      return userRole;
    },
    enabled: !!session?.user.id,
  });

  const isAdmin = role === "admin";
  console.log("[useRole] Is admin?", isAdmin, "Role:", role, "Session:", !!session);

  return {
    role,
    isAdmin,
    loading
  };
}
