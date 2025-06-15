
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserRolesTable } from "@/components/admin/UserRolesTable";
import { BackButton } from "@/components/common/BackButton";
import { useEffect } from "react";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole(session);

  // Wait for both auth and role to load before making any decisions
  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    // Only redirect if we're not loading and user is not admin
    if (!isLoading && (!session || !isAdmin)) {
      console.log("[AdminUsers] Access denied, redirecting to home");
      navigate("/");
    }
  }, [isLoading, session, isAdmin, navigate]);

  // Show loading while checking authentication and role
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto py-8">
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Verificando permissões...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If not loading and user is not authenticated or not admin, don't render anything
  // (redirect will happen in useEffect)
  if (!session || !isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-8">
        <BackButton to="/admin" className="mb-6" />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        </div>
        <UserRolesTable />
      </div>
    </MainLayout>
  );
};

export default AdminUsers;
