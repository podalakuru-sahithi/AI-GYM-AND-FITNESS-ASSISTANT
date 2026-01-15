import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Salad, MessageCircle, Target, Calendar, ArrowRight } from 'lucide-react';

const actions = [
  {
    title: 'Chat with Dietician',
    description: 'Get personalized meal plans',
    icon: Salad,
    href: '/dietician',
    gradient: 'gradient-primary',
  },
  {
    title: 'Virtual Gym Buddy',
    description: 'Your AI fitness companion',
    icon: MessageCircle,
    href: '/buddy',
    gradient: 'gradient-accent',
  },
  {
    title: 'Start Workout',
    description: 'Begin your training session',
    icon: Target,
    href: '/workouts',
    gradient: 'bg-secondary',
  },
  {
    title: 'Log Activity',
    description: 'Track your daily habits',
    icon: Calendar,
    href: '/habits',
    gradient: 'bg-secondary',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-3 group hover:border-primary transition-colors"
              onClick={() => navigate(action.href)}
            >
              <div className={`p-2 rounded-lg ${action.gradient} ${action.gradient.includes('gradient') ? 'text-primary-foreground' : 'text-foreground'}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
