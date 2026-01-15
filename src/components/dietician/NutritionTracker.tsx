import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Flame, Beef, Wheat, Droplets, Trash2, Apple } from 'lucide-react';
import { format } from 'date-fns';

interface NutritionLog {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  created_at: string;
}

interface NutritionTrackerProps {
  userId: string;
  dailyCalorieGoal?: number;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

export function NutritionTracker({ userId, dailyCalorieGoal = 2000 }: NutritionTrackerProps) {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    meal_type: 'breakfast',
    food_name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: '',
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchTodaysLogs();
  }, [userId]);

  const fetchTodaysLogs = async () => {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.food_name.trim()) return;

    setIsLoading(true);
    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: userId,
      log_date: today,
      meal_type: formData.meal_type,
      food_name: formData.food_name.trim(),
      calories: parseInt(formData.calories) || 0,
      protein_g: parseFloat(formData.protein_g) || 0,
      carbs_g: parseFloat(formData.carbs_g) || 0,
      fat_g: parseFloat(formData.fat_g) || 0,
      fiber_g: parseFloat(formData.fiber_g) || 0,
    });

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log meal',
      });
    } else {
      toast({
        title: 'Meal logged!',
        description: `${formData.food_name} has been added to your log.`,
      });
      setFormData({
        meal_type: 'breakfast',
        food_name: '',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        fiber_g: '',
      });
      setIsDialogOpen(false);
      fetchTodaysLogs();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('nutrition_logs').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete log' });
    } else {
      fetchTodaysLogs();
    }
  };

  // Calculate totals
  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein_g,
      carbs: acc.carbs + log.carbs_g,
      fat: acc.fat + log.fat_g,
      fiber: acc.fiber + log.fiber_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const calorieProgress = Math.min((totals.calories / dailyCalorieGoal) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-primary" />
              Today's Nutrition
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary">
                  <Plus className="h-4 w-4 mr-1" />
                  Log Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log a Meal</DialogTitle>
                  <DialogDescription>
                    Add what you ate to track your nutrition
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meal Type</Label>
                    <Select
                      value={formData.meal_type}
                      onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="food_name">Food Name</Label>
                    <Input
                      id="food_name"
                      value={formData.food_name}
                      onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                      placeholder="e.g., Grilled chicken salad"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={formData.protein_g}
                        onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={formData.carbs_g}
                        onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={formData.fat_g}
                        onChange={(e) => setFormData({ ...formData, fat_g: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? 'Logging...' : 'Log Meal'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>{format(new Date(), 'EEEE, MMMM d')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calorie Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Calories</span>
              <span className="text-muted-foreground">
                {totals.calories} / {dailyCalorieGoal}
              </span>
            </div>
            <Progress value={calorieProgress} className="h-3" />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-4 gap-3">
            <MacroCard
              icon={<Beef className="h-4 w-4" />}
              label="Protein"
              value={`${Math.round(totals.protein)}g`}
              color="text-red-500"
            />
            <MacroCard
              icon={<Wheat className="h-4 w-4" />}
              label="Carbs"
              value={`${Math.round(totals.carbs)}g`}
              color="text-amber-500"
            />
            <MacroCard
              icon={<Droplets className="h-4 w-4" />}
              label="Fat"
              value={`${Math.round(totals.fat)}g`}
              color="text-blue-500"
            />
            <MacroCard
              icon={<Flame className="h-4 w-4" />}
              label="Fiber"
              value={`${Math.round(totals.fiber)}g`}
              color="text-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Meal Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meal Log</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No meals logged today</p>
              <p className="text-sm">Click "Log Meal" to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mealTypes.map((type) => {
                const mealLogs = logs.filter((log) => log.meal_type === type.value);
                if (mealLogs.length === 0) return null;

                return (
                  <div key={type.value}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {type.icon} {type.label}
                    </h4>
                    <div className="space-y-2">
                      {mealLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                        >
                          <div>
                            <p className="font-medium">{log.food_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.calories} cal · {log.protein_g}g P · {log.carbs_g}g C · {log.fat_g}g F
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            onClick={() => handleDelete(log.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MacroCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const MacroCard = ({ icon, label, value, color }: MacroCardProps) => (
  <div className="text-center p-3 rounded-lg bg-muted/50">
    <div className={`inline-flex ${color} mb-1`}>{icon}</div>
    <p className="text-lg font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);
