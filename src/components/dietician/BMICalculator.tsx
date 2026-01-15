import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BMICalculatorProps {
  initialHeight?: number | null;
  initialWeight?: number | null;
  targetWeight?: number | null;
}

interface BMICategory {
  label: string;
  range: string;
  color: string;
  icon: React.ReactNode;
}

const getBMICategory = (bmi: number): BMICategory => {
  if (bmi < 18.5) {
    return {
      label: 'Underweight',
      range: '< 18.5',
      color: 'text-info',
      icon: <TrendingDown className="h-5 w-5" />,
    };
  } else if (bmi < 25) {
    return {
      label: 'Normal',
      range: '18.5 - 24.9',
      color: 'text-success',
      icon: <Minus className="h-5 w-5" />,
    };
  } else if (bmi < 30) {
    return {
      label: 'Overweight',
      range: '25 - 29.9',
      color: 'text-warning',
      icon: <TrendingUp className="h-5 w-5" />,
    };
  } else {
    return {
      label: 'Obese',
      range: '≥ 30',
      color: 'text-destructive',
      icon: <TrendingUp className="h-5 w-5" />,
    };
  }
};

export function BMICalculator({ initialHeight, initialWeight, targetWeight }: BMICalculatorProps) {
  const [height, setHeight] = useState<string>(initialHeight?.toString() || '');
  const [weight, setWeight] = useState<string>(initialWeight?.toString() || '');
  const [bmi, setBMI] = useState<number | null>(null);

  useEffect(() => {
    if (initialHeight) setHeight(initialHeight.toString());
    if (initialWeight) setWeight(initialWeight.toString());
  }, [initialHeight, initialWeight]);

  useEffect(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (h > 0 && w > 0) {
      const calculatedBMI = w / Math.pow(h / 100, 2);
      setBMI(Math.round(calculatedBMI * 10) / 10);
    } else {
      setBMI(null);
    }
  }, [height, weight]);

  const category = bmi ? getBMICategory(bmi) : null;
  const progressValue = bmi ? Math.min((bmi / 40) * 100, 100) : 0;

  // Calculate ideal weight range
  const heightM = parseFloat(height) / 100;
  const idealWeightMin = heightM > 0 ? Math.round(18.5 * heightM * heightM) : null;
  const idealWeightMax = heightM > 0 ? Math.round(24.9 * heightM * heightM) : null;

  // Weight to lose/gain
  const currentWeight = parseFloat(weight);
  const weightDiff = targetWeight && currentWeight ? Math.round((currentWeight - targetWeight) * 10) / 10 : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          BMI Calculator
        </CardTitle>
        <CardDescription>
          Calculate your Body Mass Index and track your progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bmi-height">Height (cm)</Label>
            <Input
              id="bmi-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmi-weight">Weight (kg)</Label>
            <Input
              id="bmi-weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
          </div>
        </div>

        {/* BMI Result */}
        {bmi && category && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your BMI</p>
                <p className="text-4xl font-bold font-display">{bmi}</p>
              </div>
              <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full bg-muted', category.color)}>
                {category.icon}
                <span className="font-medium">{category.label}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progressValue} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
            </div>

            {/* Ideal Weight Range */}
            {idealWeightMin && idealWeightMax && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Ideal weight range for your height</p>
                <p className="text-lg font-semibold">
                  {idealWeightMin} - {idealWeightMax} kg
                </p>
              </div>
            )}

            {/* Weight Goal Progress */}
            {weightDiff !== null && targetWeight && (
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">To reach your goal of {targetWeight} kg</p>
                <p className="text-lg font-semibold">
                  {weightDiff > 0 ? (
                    <span className="text-primary">Lose {weightDiff} kg</span>
                  ) : weightDiff < 0 ? (
                    <span className="text-accent">Gain {Math.abs(weightDiff)} kg</span>
                  ) : (
                    <span className="text-success">You're at your goal! 🎉</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {!bmi && (
          <div className="text-center py-8 text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Enter your height and weight to calculate BMI</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
