
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useAdminRewards } from "@/hooks/useAdminRewards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminRewardsHeader } from "@/components/admin/rewards/AdminRewardsHeader";
import { RewardsTable } from "@/components/admin/rewards/RewardsTable";
import { RewardFormDialog } from "@/components/admin/rewards/RewardFormDialog";

const AdminRewards = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const { rewards, isLoading, createReward, updateReward } = useAdminRewards();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);

  if (!session || !isAdmin) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingReward) {
        await updateReward(data);
      } else {
        await createReward(data);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving reward:", error);
    }
  };

  const resetForm = () => {
    setEditingReward(null);
  };

  const handleEdit = (reward: any) => {
    setEditingReward(reward);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AdminRewardsHeader />
            <RewardFormDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              editingReward={editingReward}
              onSubmit={handleSubmit}
              onReset={resetForm}
            />
          </Dialog>
          <CardContent>
            <RewardsTable rewards={rewards} onEdit={handleEdit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRewards;
