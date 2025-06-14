
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EcoAction {
  id: string;
  action_description: string;
  impact_score: number;
  action_date: string;
  friend_invites: number;
}

export const useEcoActions = () => {
  const [ecoActions, setEcoActions] = useState<EcoAction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchEcoActions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('eco_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('action_date', { ascending: false });

      if (error) throw error;
      setEcoActions(data || []);
    } catch (error) {
      console.error('Error fetching eco actions:', error);
      toast({
        title: "Error",
        description: "Failed to load your eco actions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addEcoAction = async (actionDescription: string, impactScore?: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('eco_actions')
        .insert([
          {
            user_id: user.id,
            action_description: actionDescription,
            impact_score: impactScore || Math.floor(Math.random() * 5) + 1,
            action_date: new Date().toISOString().split('T')[0]
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setEcoActions([data, ...ecoActions]);
      toast({
        title: "Action logged!",
        description: `You earned ${data.impact_score} eco points!`,
      });
    } catch (error) {
      console.error('Error adding eco action:', error);
      toast({
        title: "Error",
        description: "Failed to log your eco action.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEcoActions();
  }, [user]);

  return {
    ecoActions,
    loading,
    addEcoAction,
    refetch: fetchEcoActions
  };
};
