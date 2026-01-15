import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent';
}

export function StatCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden transition-all hover:shadow-lg',
      variant === 'primary' && 'gradient-primary text-primary-foreground',
      variant === 'accent' && 'gradient-accent text-accent-foreground'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn(
              'text-sm font-medium',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
            )}>
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display">{value}</span>
              {trend && (
                <span className={cn(
                  'text-sm font-medium',
                  trend.positive ? 'text-success' : 'text-destructive',
                  variant !== 'default' && 'opacity-90'
                )}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className={cn(
                'text-sm',
                variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-xl',
            variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-white/20'
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
