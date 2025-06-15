
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { BackButton } from "@/components/common/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoucherDesigner } from "@/components/admin/VoucherDesigner";
import { Ticket, Palette } from "lucide-react";

export default function AdminVouchers() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  if (!session || !isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <BackButton to="/admin" className="mb-6" />

          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <Palette className="h-8 w-8 text-primary" />
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Designer de Vouchers</h1>
              <p className="text-muted-foreground">
                Personalize o design e layout dos seus ingressos/vouchers
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Personalizar Ingresso
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure os dados e visualize como ficará o ingresso final. Use o preview para testar diferentes layouts.
              </p>
            </CardHeader>
            <CardContent>
              <VoucherDesigner />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
