
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { UserRole } from "@/types";

export function useRole(session: Session | null) {
  const { data: role } = useQuery({
    queryKey: ["user-role", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data?.role as UserRole;
    },
    enabled: !!session?.user.id,
  });

  const isAdmin = role === "admin";

  return {
    role,
    isAdmin,
  };
}
