import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { GymBuddyChat } from '@/components/buddy/GymBuddyChat';
import { supabase } from '@/integrations/supabase/client';

export default function Buddy() {
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Virtual Gym Buddy</h1>
          <p className="text-muted-foreground">Your AI fitness companion for motivation and support</p>
        </div>

        <div className="max-w-3xl">
          <GymBuddyChat userProfile={userProfile} />
        </div>
      </div>
    </DashboardLayout>
  );
}
