import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddGoalFormProps {
  onSubmit: (memberName: string, goalText: string) => void;
  isLoading: boolean;
}

const AddGoalForm = ({ onSubmit, isLoading }: AddGoalFormProps) => {
  const [memberName, setMemberName] = useState("");
  const [goalText, setGoalText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberName.trim() && goalText.trim()) {
      onSubmit(memberName.trim(), goalText.trim());
      setMemberName("");
      setGoalText("");
    }
  };

  return (
    <Card className="gradient-card border-border/20 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ประกาศเป้าหมายของคุณ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberName" className="text-sm font-medium">
              ชื่อของคุณ
            </Label>
            <Input
              id="memberName"
              placeholder="กรอกชื่อของคุณ"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goalText" className="text-sm font-medium">
              เป้าหมายทางธุรกิจ
            </Label>
            <Textarea
              id="goalText"
              placeholder="อธิบายเป้าหมายทางธุรกิจของคุณ..."
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary min-h-[100px] resize-none"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !memberName.trim() || !goalText.trim()}
            className="w-full gradient-primary hover:shadow-business transition-all duration-300"
            size="lg"
          >
            {isLoading ? (
              "กำลังเพิ่ม..."
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                ประกาศเป้าหมาย
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddGoalForm;