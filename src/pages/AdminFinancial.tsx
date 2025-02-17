
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { FinancialDashboard } from "@/components/admin/FinancialDashboard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const AdminFinancial = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const handleExportData = () => {
    // TODO: Implementar exportação de dados financeiros
    console.log("Exportar dados financeiros");
  };

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <Button onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
        <FinancialDashboard />
      </div>
    </MainLayout>
  );
};

export default AdminFinancial;
