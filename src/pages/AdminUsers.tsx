
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserRolesTable } from "@/components/admin/UserRolesTable";
import { BackButton } from "@/components/common/BackButton";
import { useEffect } from "react";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { isAdmin } = useRole(session);

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      console.log("[AdminUsers] Access denied, redirecting to home");
      navigate("/");
    }
  }, [loading, session, isAdmin, navigate]);

  // Show loading while checking authentication
  if (loading || !session || !isAdmin) {
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
