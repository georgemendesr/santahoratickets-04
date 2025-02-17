
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { FinancialDashboard } from "@/components/admin/FinancialDashboard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exportFinancialData } from "@/utils/exportFinancialData";
import { toast } from "sonner";

const AdminFinancial = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  const { data: financialData } = useQuery({
    queryKey: ["financial-export-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("title, date, gross_revenue, net_revenue, approved_tickets")
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const handleExportData = () => {
    if (!financialData?.length) {
      toast.error("Não há dados para exportar");
      return;
    }

    try {
      exportFinancialData(financialData);
      toast.success("Relatório exportado com sucesso");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar relatório");
    }
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
