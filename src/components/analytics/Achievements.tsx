import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trophy, Medal, Star, Award, Target, Flame, Dumbbell, Heart } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  badge_type: string;
  earned_at: string;
  points: number;
}

const badgeIcons: Record<string, any> = {
  challenge_complete: Trophy,
  streak: Flame,
  workout: Dumbbell,
  nutrition: Heart,
  milestone: Medal,
  special: Star,
  default: Award
};

const badgeColors: Record<string, string> = {
  challenge_complete: 'text-yellow-500',
  streak: 'text-orange-500',
  workout: 'text-blue-500',
  nutrition: 'text-green-500',
  milestone: 'text-purple-500',
  special: 'text-pink-500',
  default: 'text-gray-500'
};

export function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('earned_at', { ascending: false });

      if (error) throw error;
      
      setAchievements(data || []);
      setTotalPoints(data?.reduce((sum, a) => sum + (a.points || 0), 0) || 0);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    return badgeIcons[badgeType] || badgeIcons.default;
  };

  const getBadgeColor = (badgeType: string) => {
    return badgeColors[badgeType] || badgeColors.default;
  };

  // Define unlockable achievements
  const potentialAchievements = [
    { name: 'First Steps', description: 'Complete your first workout', badge_type: 'workout', locked: true },
    { name: '7 Day Streak', description: 'Work out for 7 days in a row', badge_type: 'streak', locked: true },
    { name: 'Nutrition Master', description: 'Log meals for 30 days', badge_type: 'nutrition', locked: true },
    { name: 'Challenge Champion', description: 'Complete 5 challenges', badge_type: 'challenge_complete', locked: true },
    { name: 'Century Club', description: 'Burn 10,000 calories total', badge_type: 'milestone', locked: true },
    { name: 'Habit Hero', description: 'Maintain 10 habit streaks', badge_type: 'streak', locked: true },
  ];

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading achievements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Total Points Earned</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              {totalPoints.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Achievements Unlocked</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              {achievements.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {achievements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Earned Achievements
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => {
              const Icon = getBadgeIcon(achievement.badge_type);
              const color = getBadgeColor(achievement.badge_type);
              
              return (
                <Card key={achievement.id} className="border-yellow-500/30 bg-yellow-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full bg-background ${color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.name}</h4>
                        {achievement.description && (
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(achievement.earned_at), 'MMM d, yyyy')}
                          </Badge>
                          <span className="text-sm font-medium text-yellow-600">
                            +{achievement.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Achievements to Unlock
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {potentialAchievements.map((achievement, i) => {
            const Icon = getBadgeIcon(achievement.badge_type);
            const isUnlocked = achievements.some(a => a.name === achievement.name);
            
            if (isUnlocked) return null;
            
            return (
              <Card key={i} className="opacity-60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-muted-foreground">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <Badge variant="outline" className="mt-2">Locked</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {achievements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No achievements yet. Complete workouts, challenges, and maintain streaks to earn badges!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
