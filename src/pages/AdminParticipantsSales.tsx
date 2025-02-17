
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminParticipantsSales = () => {
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
            <h1 className="text-3xl font-bold">Vendas</h1>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprador</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Qtd. Ingressos</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Data Compra</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Dados serão carregados aqui */}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminParticipantsSales;
