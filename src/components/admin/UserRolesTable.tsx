
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";
import { useAdminUsers } from "@/hooks/useAdminQueries";
import { toast } from "sonner";

export function UserRolesTable() {
  const [updating, setUpdating] = useState(false);
  const { data: users, refetch } = useAdminUsers();

  const toggleUserRole = async (userId: string, currentRole: UserRole) => {
    setUpdating(true);
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      
      console.log(`[UserRolesTable] Updating role for user ${userId} from ${currentRole} to ${newRole}`);

      const { error } = await supabase
        .from("user_roles")
        .upsert(
          { user_id: userId, role: newRole },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("[UserRolesTable] Error updating role:", error);
        throw error;
      }

      toast.success(`Role atualizado para ${newRole}`);
      await refetch();
    } catch (error: any) {
      console.error("[UserRolesTable] Error:", error);
      toast.error("Erro ao atualizar role: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const checkCurrentUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("[UserRolesTable] Current user ID:", user.id);
        
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id);
          
        console.log("[UserRolesTable] Current user role data:", roleData);
        if (error) {
          console.error("[UserRolesTable] Error fetching current user role:", error);
        }
      }
    } catch (error) {
      console.error("[UserRolesTable] Error checking current user role:", error);
    }
  };

  if (!users) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div className="space-y-4">
      <Button onClick={checkCurrentUserRole} variant="outline">
        Debug: Verificar meu role atual
      </Button>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || "N/A"}</TableCell>
                <TableCell>{user.email || "N/A"}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updating}
                    onClick={() => toggleUserRole(user.id, user.role as UserRole)}
                  >
                    Tornar {user.role === "admin" ? "Usuário" : "Admin"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
