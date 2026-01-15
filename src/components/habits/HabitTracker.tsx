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
import { Plus, CheckCircle2, Flame, Target, Trash2 } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  target_count: number;
  category: string;
  is_active: boolean;
  streak?: number;
  completedToday?: boolean;
}

export function HabitTracker() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: 1,
    category: 'fitness'
  });

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;

      const today = new Date().toISOString().split('T')[0];
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('habit_id, streak_count')
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`);

      const completedToday = new Set(logsData?.map(log => log.habit_id) || []);
      const streaks = new Map(logsData?.map(log => [log.habit_id, log.streak_count]) || []);

      const enrichedHabits = (habitsData || []).map(habit => ({
        ...habit,
        completedToday: completedToday.has(habit.id),
        streak: streaks.get(habit.id) || 0
      }));

      setHabits(enrichedHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async () => {
    if (!user || !newHabit.name.trim()) return;

    try {
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: newHabit.name,
        description: newHabit.description || null,
        frequency: newHabit.frequency,
        target_count: newHabit.target_count,
        category: newHabit.category
      });

      if (error) throw error;

      toast.success('Habit created!');
      setNewHabit({ name: '', description: '', frequency: 'daily', target_count: 1, category: 'fitness' });
      setShowForm(false);
      loadHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error('Failed to create habit');
    }
  };

  const completeHabit = async (habit: Habit) => {
    if (!user || habit.completedToday) return;

    try {
      const newStreak = (habit.streak || 0) + 1;
      const { error } = await supabase.from('habit_logs').insert({
        habit_id: habit.id,
        user_id: user.id,
        streak_count: newStreak
      });

      if (error) throw error;

      toast.success(`🎉 ${habit.name} completed! Streak: ${newStreak} days`);
      loadHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error('Failed to log habit');
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase.from('habits').delete().eq('id', habitId);
      if (error) throw error;
      toast.success('Habit deleted');
      loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading habits...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Progress
              </CardTitle>
              <CardDescription>
                {completedCount} of {totalHabits} habits completed
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Habit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Habit Name</Label>
                <Input
                  placeholder="e.g., Morning Run"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newHabit.category} onValueChange={(v) => setNewHabit({ ...newHabit, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={newHabit.frequency} onValueChange={(v) => setNewHabit({ ...newHabit, frequency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="3x_week">3x per week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Brief description"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={createHabit} className="w-full">Create Habit</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <Card key={habit.id} className={habit.completedToday ? 'border-green-500/50 bg-green-500/5' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{habit.name}</h3>
                    <Badge variant="outline">{habit.category}</Badge>
                  </div>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground">{habit.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{habit.streak || 0} day streak</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={habit.completedToday ? 'secondary' : 'default'}
                    disabled={habit.completedToday}
                    onClick={() => completeHabit(habit)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteHabit(habit.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {habits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No habits yet. Create your first habit to start tracking!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
