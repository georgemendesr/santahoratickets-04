
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface RewardsTableProps {
  rewards: any[];
  onEdit: (reward: any) => void;
}

export function RewardsTable({ rewards, onEdit }: RewardsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Pontos</TableHead>
          <TableHead>Unidades</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rewards.map((reward: any) => (
          <TableRow key={reward.id}>
            <TableCell className="font-medium">{reward.name}</TableCell>
            <TableCell className="max-w-xs truncate">{reward.description}</TableCell>
            <TableCell>{reward.points_required}</TableCell>
            <TableCell>
              {reward.available_units !== null ? reward.available_units : "Ilimitado"}
            </TableCell>
            <TableCell>
              <Badge variant={reward.active ? "default" : "secondary"}>
                {reward.active ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(reward)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
