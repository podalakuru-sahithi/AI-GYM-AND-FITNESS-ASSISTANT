import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { WorkoutScheduler } from '@/components/habits/WorkoutScheduler';
import { Target, Calendar } from 'lucide-react';

export default function Habits() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fitness Habit Tracker</h1>
          <p className="text-muted-foreground">Build healthy habits and schedule your workouts</p>
        </div>

        <Tabs defaultValue="habits" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Habits
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits">
            <HabitTracker />
          </TabsContent>

          <TabsContent value="schedule">
            <WorkoutScheduler />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
