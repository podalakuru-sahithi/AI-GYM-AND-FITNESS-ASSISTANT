import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Dumbbell, CheckCircle, X } from 'lucide-react';

interface ScheduledWorkout {
  id: string;
  workout_id: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  status: string;
  notes: string | null;
  workouts?: {
    name: string;
    workout_type: string;
    duration_minutes: number;
  };
}

export function WorkoutScheduler() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newSchedule, setNewSchedule] = useState({
    workout_name: '',
    workout_type: 'strength',
    scheduled_time: '09:00',
    duration: 45,
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadSchedule();
    }
  }, [user]);

  const loadSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_schedule')
        .select(`
          *,
          workouts (name, workout_type, duration_minutes)
        `)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .limit(20);

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const createScheduledWorkout = async () => {
    if (!user || !selectedDate || !newSchedule.workout_name.trim()) return;

    try {
      // First create the workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: newSchedule.workout_name,
          workout_type: newSchedule.workout_type,
          duration_minutes: newSchedule.duration,
          exercises: []
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Then schedule it
      const { error: scheduleError } = await supabase
        .from('workout_schedule')
        .insert({
          user_id: user.id,
          workout_id: workoutData.id,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: newSchedule.scheduled_time,
          notes: newSchedule.notes || null
        });

      if (scheduleError) throw scheduleError;

      toast.success('Workout scheduled!');
      setNewSchedule({ workout_name: '', workout_type: 'strength', scheduled_time: '09:00', duration: 45, notes: '' });
      setShowForm(false);
      loadSchedule();
    } catch (error) {
      console.error('Error scheduling workout:', error);
      toast.error('Failed to schedule workout');
    }
  };

  const updateStatus = async (scheduleId: string, status: string) => {
    try {
      const updateData: { status: string; completed_at?: string } = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('workout_schedule')
        .update(updateData)
        .eq('id', scheduleId);

      if (error) throw error;
      toast.success(`Workout marked as ${status}`);
      loadSchedule();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'skipped': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading schedule...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Workout Schedule
              </CardTitle>
              <CardDescription>Plan and track your workouts</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Dumbbell className="h-4 w-4 mr-2" />
              Schedule Workout
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Workout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Workout Name</Label>
                <Input
                  placeholder="e.g., Upper Body Day"
                  value={newSchedule.workout_name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, workout_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Workout Type</Label>
                <Select 
                  value={newSchedule.workout_type} 
                  onValueChange={(v) => setNewSchedule({ ...newSchedule, workout_type: v })}
                >
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
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newSchedule.scheduled_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={newSchedule.duration}
                  onChange={(e) => setNewSchedule({ ...newSchedule, duration: parseInt(e.target.value) || 45 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="Any notes..."
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={createScheduledWorkout} className="w-full">Schedule Workout</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {schedule.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.workouts?.name || 'Workout'}</h3>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    <Badge variant="outline">{item.workouts?.workout_type || 'General'}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {format(new Date(item.scheduled_date), 'EEE, MMM d')}
                    </span>
                    {item.scheduled_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {item.scheduled_time}
                      </span>
                    )}
                    {item.workouts?.duration_minutes && (
                      <span>{item.workouts.duration_minutes} min</span>
                    )}
                  </div>
                  {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                </div>
                {item.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(item.id, 'completed')}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Done
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(item.id, 'skipped')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schedule.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No workouts scheduled. Plan your first workout!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
