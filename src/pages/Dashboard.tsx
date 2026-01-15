import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Footprints, Target, Droplets, Trophy, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-primary" />
          <span className="text-lg font-display">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold">
            Good morning, {userName}! 💪
          </h1>
          <p className="text-muted-foreground">
            Let's crush your fitness goals today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Calories Burned"
            value="1,847"
            subtitle="of 2,500 goal"
            icon={<Flame className="h-5 w-5" />}
            trend={{ value: 12, positive: true }}
            variant="primary"
          />
          <StatCard
            title="Steps Today"
            value="8,432"
            subtitle="of 10,000 goal"
            icon={<Footprints className="h-5 w-5" />}
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Workouts This Week"
            value="4"
            subtitle="of 5 planned"
            icon={<Target className="h-5 w-5" />}
          />
          <StatCard
            title="Water Intake"
            value="2.1L"
            subtitle="of 3L goal"
            icon={<Droplets className="h-5 w-5" />}
            variant="accent"
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AchievementItem 
                title="7-Day Streak"
                description="Logged activity for 7 days in a row"
                earned
              />
              <AchievementItem 
                title="First Workout"
                description="Complete your first workout"
                earned
              />
              <AchievementItem 
                title="Calorie Champion"
                description="Hit your calorie goal 5 times"
                progress={60}
              />
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">{day}</p>
                  <div 
                    className={`h-20 rounded-lg transition-colors ${
                      i < 4 ? 'gradient-primary' : 'bg-muted'
                    }`}
                    style={{ 
                      opacity: i < 4 ? 0.3 + (i * 0.2) : 0.3 
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

interface AchievementItemProps {
  title: string;
  description: string;
  earned?: boolean;
  progress?: number;
}

const AchievementItem = ({ title, description, earned, progress }: AchievementItemProps) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
      earned ? 'gradient-primary' : 'bg-muted'
    }`}>
      <Trophy className={`h-5 w-5 ${earned ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
    </div>
    <div className="flex-1">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      {progress && (
        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  </div>
);

export default Dashboard;
