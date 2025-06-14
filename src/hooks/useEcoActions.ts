
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface EcoAction {
  id: string;
  action_description: string;
  impact_score: number;
  action_date: string;
  friend_invites: number;
}

export const useEcoActions = () => {
  const [ecoActions, setEcoActions] = useState<EcoAction[]>([
    {
      id: '1',
      action_description: 'Used public transport to work',
      impact_score: 5,
      action_date: '2024-06-14',
      friend_invites: 0
    },
    {
      id: '2',
      action_description: 'Brought reusable water bottle',
      impact_score: 3,
      action_date: '2024-06-13',
      friend_invites: 0
    },
    {
      id: '3',
      action_description: 'Recycled electronics properly',
      impact_score: 8,
      action_date: '2024-06-12',
      friend_invites: 0
    }
  ]);
  const [loading, setLoading] = useState(false);

  const addEcoAction = async (actionDescription: string, impactScore?: number) => {
    try {
      const newAction: EcoAction = {
        id: Date.now().toString(),
        action_description: actionDescription,
        impact_score: impactScore || Math.floor(Math.random() * 5) + 1,
        action_date: new Date().toISOString().split('T')[0],
        friend_invites: 0
      };

      setEcoActions([newAction, ...ecoActions]);
      toast({
        title: "Action logged!",
        description: `You earned ${newAction.impact_score} eco points!`,
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

  const fetchEcoActions = async () => {
    // Mock function for now - data is already set in state
  };

  return {
    ecoActions,
    loading,
    addEcoAction,
    refetch: fetchEcoActions
  };
};
