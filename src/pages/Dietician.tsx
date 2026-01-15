import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAIChat } from '@/hooks/useAIChat';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ChatInterface } from '@/components/dietician/ChatInterface';
import { BMICalculator } from '@/components/dietician/BMICalculator';
import { NutritionTracker } from '@/components/dietician/NutritionTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Calculator, Apple, ShoppingCart } from 'lucide-react';

interface UserProfile {
  full_name: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  target_weight_kg: number | null;
  fitness_goal: string | null;
  activity_level: string | null;
  dietary_preference: string | null;
  allergies: string[] | null;
  medical_conditions: string[] | null;
}

const quickActions = [
  { label: '🍽️ Create Diet Plan', action: 'generate_diet_plan', message: 'Create a personalized 7-day diet plan for me based on my profile and goals.' },
  { label: '🛒 Grocery List', action: 'generate_grocery_list', message: 'Generate a healthy grocery shopping list for the week.' },
  { label: '📊 Analyze My Diet', action: 'analyze', message: 'Analyze my current eating habits and suggest improvements.' },
  { label: '🍳 Quick Meal Ideas', action: 'meal_ideas', message: 'Give me 5 quick and healthy meal ideas for today.' },
];

const Dietician = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const {
    messages,
    isLoading,
    sendMessage,
    loadChatHistory,
    clearHistory,
  } = useAIChat({ chatType: 'dietician', userProfile });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      loadChatHistory(user.id);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, height_cm, weight_kg, target_weight_kg, fitness_goal, activity_level, dietary_preference, allergies, medical_conditions')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
    setProfileLoading(false);
  };

  const handleSendMessage = (message: string, action?: string) => {
    if (user) {
      sendMessage(user.id, message, action);
    }
  };

  const handleClearHistory = () => {
    if (user) {
      clearHistory(user.id);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary" />
            <span className="text-lg font-display">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">AI Dietician</h1>
          <p className="text-muted-foreground">
            Your personal nutrition expert for diet plans, calorie tracking, and healthy eating advice.
          </p>
        </div>

        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <Apple className="h-4 w-4" />
              <span className="hidden sm:inline">Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="bmi" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">BMI</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Plans</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChatInterface
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  onClearHistory={handleClearHistory}
                  placeholder="Ask about nutrition, meal plans, or log your food..."
                  quickActions={quickActions}
                />
              </div>
              <div className="space-y-4">
                <BMICalculator
                  initialHeight={userProfile?.height_cm}
                  initialWeight={userProfile?.weight_kg}
                  targetWeight={userProfile?.target_weight_kg}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracker">
            <div className="max-w-2xl">
              <NutritionTracker userId={user.id} dailyCalorieGoal={2000} />
            </div>
          </TabsContent>

          <TabsContent value="bmi">
            <div className="max-w-md">
              <BMICalculator
                initialHeight={userProfile?.height_cm}
                initialWeight={userProfile?.weight_kg}
                targetWeight={userProfile?.target_weight_kg}
              />
            </div>
          </TabsContent>

          <TabsContent value="plans">
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Diet Plans & Grocery Lists</h3>
              <p className="max-w-md mx-auto">
                Chat with the AI Dietician to generate personalized diet plans and grocery lists. 
                They'll appear here for easy reference.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dietician;
