import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { Scale, TrendingUp, Plus, Activity } from 'lucide-react';

interface ProgressLog {
  id: string;
  log_date: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  muscle_mass_kg: number | null;
  notes: string | null;
}

export function ProgressTracker() {
  const { user } = useAuth();
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState({
    weight_kg: '',
    body_fat_percentage: '',
    muscle_mass_kg: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadProgressLogs();
    }
  }, [user]);

  const loadProgressLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .order('log_date', { ascending: true })
        .limit(90);

      if (error) throw error;
      setProgressLogs(data || []);
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const logProgress = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('progress_logs').insert({
        user_id: user.id,
        weight_kg: newLog.weight_kg ? parseFloat(newLog.weight_kg) : null,
        body_fat_percentage: newLog.body_fat_percentage ? parseFloat(newLog.body_fat_percentage) : null,
        muscle_mass_kg: newLog.muscle_mass_kg ? parseFloat(newLog.muscle_mass_kg) : null,
        notes: newLog.notes || null
      });

      if (error) throw error;

      toast.success('Progress logged!');
      setNewLog({ weight_kg: '', body_fat_percentage: '', muscle_mass_kg: '', notes: '' });
      setShowForm(false);
      loadProgressLogs();
    } catch (error) {
      console.error('Error logging progress:', error);
      toast.error('Failed to log progress');
    }
  };

  const chartData = progressLogs.map(log => ({
    date: format(new Date(log.log_date), 'MMM d'),
    weight: log.weight_kg,
    bodyFat: log.body_fat_percentage,
    muscle: log.muscle_mass_kg
  }));

  const getWeightChange = () => {
    if (progressLogs.length < 2) return null;
    const first = progressLogs[0].weight_kg;
    const last = progressLogs[progressLogs.length - 1].weight_kg;
    if (!first || !last) return null;
    return (last - first).toFixed(1);
  };

  const weightChange = getWeightChange();

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading progress data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Weight</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Scale className="h-5 w-5" />
              {progressLogs.length > 0 && progressLogs[progressLogs.length - 1].weight_kg 
                ? `${progressLogs[progressLogs.length - 1].weight_kg} kg`
                : 'N/A'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weightChange && (
              <p className={`text-sm ${parseFloat(weightChange) < 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg since start
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Body Fat %</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {progressLogs.length > 0 && progressLogs[progressLogs.length - 1].body_fat_percentage 
                ? `${progressLogs[progressLogs.length - 1].body_fat_percentage}%`
                : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Logs</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {progressLogs.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1" />
              Log Progress
            </Button>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log Today's Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 75.5"
                  value={newLog.weight_kg}
                  onChange={(e) => setNewLog({ ...newLog, weight_kg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Body Fat %</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 18.5"
                  value={newLog.body_fat_percentage}
                  onChange={(e) => setNewLog({ ...newLog, body_fat_percentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Muscle Mass (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 35.0"
                  value={newLog.muscle_mass_kg}
                  onChange={(e) => setNewLog({ ...newLog, muscle_mass_kg: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="How are you feeling?"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={logProgress} className="w-full">Save Progress</Button>
          </CardContent>
        </Card>
      )}

      {progressLogs.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Weight Trend</CardTitle>
              <CardDescription>Your weight over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                      name="Weight (kg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {chartData.some(d => d.bodyFat) && (
            <Card>
              <CardHeader>
                <CardTitle>Body Composition</CardTitle>
                <CardDescription>Body fat and muscle mass trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="bodyFat" 
                        stroke="hsl(var(--destructive))" 
                        name="Body Fat %"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="muscle" 
                        stroke="hsl(var(--chart-2))" 
                        name="Muscle Mass (kg)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {progressLogs.length === 0 && !showForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No progress data yet. Start tracking!</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
