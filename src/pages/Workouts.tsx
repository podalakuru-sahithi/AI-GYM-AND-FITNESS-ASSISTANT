import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutLibrary } from '@/components/workouts/WorkoutLibrary';
import { Challenges } from '@/components/workouts/Challenges';
import { Dumbbell, Trophy } from 'lucide-react';

export default function Workouts() {
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
          <h1 className="text-3xl font-bold">Workout Recommender & Planner</h1>
          <p className="text-muted-foreground">Build workouts and take on fitness challenges</p>
        </div>

        <Tabs defaultValue="library" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Workout Library
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <WorkoutLibrary />
          </TabsContent>

          <TabsContent value="challenges">
            <Challenges />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
