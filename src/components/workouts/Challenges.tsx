import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { Trophy, Target, Calendar, Plus, Trash2 } from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: string;
  reward_points: number;
}

export function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    challenge_type: 'workout_count',
    target_value: 10,
    duration_days: 7
  });

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async () => {
    if (!user || !newChallenge.name.trim()) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + newChallenge.duration_days);

    try {
      const { error } = await supabase.from('challenges').insert({
        user_id: user.id,
        name: newChallenge.name,
        description: newChallenge.description || null,
        challenge_type: newChallenge.challenge_type,
        target_value: newChallenge.target_value,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        reward_points: newChallenge.target_value * 10
      });

      if (error) throw error;

      toast.success('Challenge created! 🎯');
      setNewChallenge({ name: '', description: '', challenge_type: 'workout_count', target_value: 10, duration_days: 7 });
      setShowForm(false);
      loadChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge');
    }
  };

  const updateProgress = async (challengeId: string, increment: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const newValue = Math.min(challenge.current_value + increment, challenge.target_value);
    const newStatus = newValue >= challenge.target_value ? 'completed' : 'active';

    try {
      const { error } = await supabase
        .from('challenges')
        .update({ current_value: newValue, status: newStatus })
        .eq('id', challengeId);

      if (error) throw error;

      if (newStatus === 'completed') {
        toast.success(`🎉 Challenge completed! You earned ${challenge.reward_points} points!`);
        
        // Award achievement
        await supabase.from('achievements').insert({
          user_id: user!.id,
          name: `Completed: ${challenge.name}`,
          description: `Successfully completed the ${challenge.name} challenge`,
          badge_type: 'challenge_complete',
          points: challenge.reward_points
        });
      } else {
        toast.success('Progress updated!');
      }
      
      loadChallenges();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase.from('challenges').delete().eq('id', challengeId);
      if (error) throw error;
      toast.success('Challenge deleted');
      loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'workout_count': return 'Workouts';
      case 'calories_burned': return 'Calories';
      case 'steps': return 'Steps';
      case 'habit_streak': return 'Habit Days';
      default: return type;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading challenges...</div>;
  }

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Fitness Challenges
              </CardTitle>
              <CardDescription>Set goals and track your progress</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Challenge
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Challenge Name</Label>
                <Input
                  placeholder="e.g., 30 Day Workout Streak"
                  value={newChallenge.name}
                  onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Challenge Type</Label>
                <Select value={newChallenge.challenge_type} onValueChange={(v) => setNewChallenge({ ...newChallenge, challenge_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workout_count">Complete Workouts</SelectItem>
                    <SelectItem value="calories_burned">Burn Calories</SelectItem>
                    <SelectItem value="steps">Steps</SelectItem>
                    <SelectItem value="habit_streak">Habit Streak Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Value</Label>
                <Input
                  type="number"
                  value={newChallenge.target_value}
                  onChange={(e) => setNewChallenge({ ...newChallenge, target_value: parseInt(e.target.value) || 10 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Select value={newChallenge.duration_days.toString()} onValueChange={(v) => setNewChallenge({ ...newChallenge, duration_days: parseInt(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="21">21 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="What's this challenge about?"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={createChallenge} className="w-full">Create Challenge</Button>
          </CardContent>
        </Card>
      )}

      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Challenges</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activeChallenges.map((challenge) => {
              const progress = (challenge.current_value / challenge.target_value) * 100;
              const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());

              return (
                <Card key={challenge.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{challenge.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getStatusColor(challenge.status)}>{challenge.status}</Badge>
                          <Badge variant="outline">{getChallengeTypeLabel(challenge.challenge_type)}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteChallenge(challenge.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {challenge.description && (
                      <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>{challenge.current_value} / {challenge.target_value}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ends today'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>{challenge.reward_points} pts</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      onClick={() => updateProgress(challenge.id, 1)}
                      disabled={challenge.current_value >= challenge.target_value}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Log Progress (+1)
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Completed Challenges 🏆</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-green-500/50 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-semibold">{challenge.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Completed on {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Earned {challenge.reward_points} points!
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No challenges yet. Create your first fitness challenge!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
