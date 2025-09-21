import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Goal {
  id: string;
  member_name: string;  
  goal_text: string;
  created_at: string;
  session_id: string;
}

interface GoalModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (goalId: string) => void;
  canDelete: boolean;
}

const GoalModal = ({ goal, isOpen, onClose, onDelete, canDelete }: GoalModalProps) => {
  if (!goal) return null;

  const handleDelete = () => {
    onDelete(goal.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md gradient-card border-border/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            เป้าหมายทางธุรกิจ
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">เป้าหมาย</h3>
            <p className="text-lg leading-relaxed">{goal.goal_text}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">ประกาศโดย</h3>
            <p className="text-base font-medium text-primary">{goal.member_name}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">วันที่ประกาศ</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(goal.created_at), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
          
          {canDelete && (
            <div className="pt-4 border-t border-border/20">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="w-full"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบเป้าหมายนี้
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;