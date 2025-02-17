
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AdminParticipants = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Participantes</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/admin/participants/list">
              <Button variant="outline" className="w-full h-24 text-lg">
                Listar Participantes
              </Button>
            </Link>
            <Link to="/admin/participants/sales">
              <Button variant="outline" className="w-full h-24 text-lg">
                Vendas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminParticipants;
