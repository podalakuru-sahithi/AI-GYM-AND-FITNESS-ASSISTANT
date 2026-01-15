import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, Dumbbell, Clock, Flame, Trash2, Edit } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

interface Workout {
  id: string;
  name: string;
  description: string | null;
  workout_type: string;
  difficulty: string;
  duration_minutes: number | null;
  calories_burned: number | null;
  exercises: Exercise[];
  is_template: boolean;
}

export function WorkoutLibrary() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    description: '',
    workout_type: 'strength',
    difficulty: 'intermediate',
    duration_minutes: 45,
    calories_burned: 300,
    exercises: [] as Exercise[]
  });
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: '10', rest: '60s' });

  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

  const loadWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedWorkouts = (data || []).map(w => ({
        ...w,
        exercises: (w.exercises as unknown as Exercise[]) || []
      }));
      
      setWorkouts(formattedWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    if (!newExercise.name.trim()) return;
    setNewWorkout({
      ...newWorkout,
      exercises: [...newWorkout.exercises, { ...newExercise }]
    });
    setNewExercise({ name: '', sets: 3, reps: '10', rest: '60s' });
  };

  const removeExercise = (index: number) => {
    setNewWorkout({
      ...newWorkout,
      exercises: newWorkout.exercises.filter((_, i) => i !== index)
    });
  };

  const createWorkout = async () => {
    if (!user || !newWorkout.name.trim()) return;

    try {
      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        name: newWorkout.name,
        description: newWorkout.description || null,
        workout_type: newWorkout.workout_type,
        difficulty: newWorkout.difficulty,
        duration_minutes: newWorkout.duration_minutes,
        calories_burned: newWorkout.calories_burned,
        exercises: newWorkout.exercises as unknown as Json,
        is_template: true
      });

      if (error) throw error;

      toast.success('Workout created!');
      setNewWorkout({
        name: '',
        description: '',
        workout_type: 'strength',
        difficulty: 'intermediate',
        duration_minutes: 45,
        calories_burned: 300,
        exercises: []
      });
      setShowForm(false);
      loadWorkouts();
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error('Failed to create workout');
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
      if (error) throw error;
      toast.success('Workout deleted');
      loadWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading workouts...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Workout Library
              </CardTitle>
              <CardDescription>Create and manage your workout templates</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workout
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Workout Name</Label>
                <Input
                  placeholder="e.g., Full Body Blast"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newWorkout.workout_type} onValueChange={(v) => setNewWorkout({ ...newWorkout, workout_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={newWorkout.difficulty} onValueChange={(v) => setNewWorkout({ ...newWorkout, difficulty: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={newWorkout.duration_minutes}
                  onChange={(e) => setNewWorkout({ ...newWorkout, duration_minutes: parseInt(e.target.value) || 45 })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the workout..."
                  value={newWorkout.description}
                  onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-4">Exercises</h4>
              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <Input
                  placeholder="Exercise name"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Sets"
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 3 })}
                />
                <Input
                  placeholder="Reps (e.g., 10 or 8-12)"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                />
                <Button onClick={addExercise}>Add Exercise</Button>
              </div>

              {newWorkout.exercises.length > 0 && (
                <div className="space-y-2">
                  {newWorkout.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span>{ex.name} - {ex.sets} x {ex.reps}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeExercise(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={createWorkout} className="w-full">Create Workout</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{workout.workout_type}</Badge>
                    <Badge className={getDifficultyColor(workout.difficulty || 'intermediate')}>
                      {workout.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteWorkout(workout.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workout.description && (
                <p className="text-sm text-muted-foreground mb-4">{workout.description}</p>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                {workout.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {workout.duration_minutes} min
                  </span>
                )}
                {workout.calories_burned && (
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    {workout.calories_burned} cal
                  </span>
                )}
              </div>
              {workout.exercises.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Exercises:</p>
                  {workout.exercises.slice(0, 3).map((ex, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      • {ex.name} ({ex.sets}x{ex.reps})
                    </p>
                  ))}
                  {workout.exercises.length > 3 && (
                    <p className="text-sm text-muted-foreground">+{workout.exercises.length - 3} more</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {workouts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No workouts yet. Create your first workout template!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
