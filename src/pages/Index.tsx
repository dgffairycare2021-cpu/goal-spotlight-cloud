import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WordCloud from "@/components/WordCloud";
import GoalModal from "@/components/GoalModal";
import AddGoalForm from "@/components/AddGoalForm";

interface Goal {
  id: string;
  member_name: string;
  goal_text: string;
  created_at: string;
  session_id: string;
}

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('business-goals-session');
    if (!storedSessionId) {
      storedSessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('business-goals-session', storedSessionId);
    }
    setSessionId(storedSessionId);

    fetchGoals();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('business-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_goals'
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('business_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลเป้าหมายได้",
        variant: "destructive",
      });
    }
  };

  const handleAddGoal = async (memberName: string, goalText: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('business_goals')
        .insert({
          member_name: memberName,
          goal_text: goalText,
          session_id: sessionId,
        });

      if (error) throw error;

      toast({
        title: "สำเร็จ!",
        description: "เพิ่มเป้าหมายของคุณแล้ว",
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มเป้าหมายได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('business_goals')
        .delete()
        .eq('id', goalId)
        .eq('session_id', sessionId);

      if (error) throw error;

      toast({
        title: "ลบแล้ว",
        description: "ลบเป้าหมายเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบเป้าหมายได้",
        variant: "destructive",
      });
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const canDeleteGoal = (goal: Goal) => {
    return goal.session_id === sessionId;
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-background mb-4">
            กระดานประกาศเป้าหมายธุรกิจ
          </h1>
          <p className="text-lg md:text-xl text-background/80 max-w-2xl mx-auto">
            แชร์และค้นหาแรงบันดาลใจจากเป้าหมายทางธุรกิจของสมาชิกเครือข่าย
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-6 shadow-card min-h-[500px]">
              <h2 className="text-2xl font-bold text-background mb-6 text-center">
                Word Cloud เป้าหมายธุรกิจ
              </h2>
              {goals.length > 0 ? (
                <WordCloud goals={goals} onGoalClick={handleGoalClick} />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-background/60 text-lg">
                    ยังไม่มีเป้าหมายที่ประกาศ เริ่มต้นด้วยการเพิ่มเป้าหมายแรกของคุณ!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <AddGoalForm onSubmit={handleAddGoal} isLoading={isLoading} />
            
            <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-6 shadow-card">
              <h3 className="text-lg font-bold text-background mb-4">
                สถิติ
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-background/80">เป้าหมายทั้งหมด</span>
                  <span className="text-background font-bold text-xl">{goals.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-background/80">เป้าหมายของคุณ</span>
                  <span className="text-background font-bold text-xl">
                    {goals.filter(goal => goal.session_id === sessionId).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GoalModal
        goal={selectedGoal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDeleteGoal}
        canDelete={selectedGoal ? canDeleteGoal(selectedGoal) : false}
      />
    </div>
  );
};

export default Index;