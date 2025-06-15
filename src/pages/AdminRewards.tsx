
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useAdminRewards } from "@/hooks/useAdminRewards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminRewardsHeader } from "@/components/admin/rewards/AdminRewardsHeader";
import { RewardsTable } from "@/components/admin/rewards/RewardsTable";
import { RewardFormDialog } from "@/components/admin/rewards/RewardFormDialog";
import { BackButton } from "@/components/common/BackButton";
import { MainLayout } from "@/components/layout/MainLayout";

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
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <BackButton to="/admin" className="mb-4" />
          
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/admin" className="mb-4" />

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
    </MainLayout>
  );
};

export default AdminRewards;
