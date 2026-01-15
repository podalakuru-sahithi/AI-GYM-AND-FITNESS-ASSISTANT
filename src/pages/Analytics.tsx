import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressTracker } from '@/components/analytics/ProgressTracker';
import { Achievements } from '@/components/analytics/Achievements';
import { TrendingUp, Trophy } from 'lucide-react';

export default function Analytics() {
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
          <h1 className="text-3xl font-bold">Progress Analytics</h1>
          <p className="text-muted-foreground">Track your fitness journey and celebrate achievements</p>
        </div>

        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressTracker />
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
