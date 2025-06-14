
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface EcoAction {
  id: string;
  action_description: string;
  impact_score: number;
  action_date: string;
  friend_invites: number;
  photo_url?: string;
  audio_url?: string;
}

interface EcoActionInput {
  description: string;
  photo?: File;
  audioBlob?: Blob;
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

  const addEcoAction = async (actionInput: EcoActionInput) => {
    try {
      setLoading(true);

      // In a real implementation, you would upload the photo and audio to storage
      // For now, we'll create placeholder URLs
      let photoUrl: string | undefined;
      let audioUrl: string | undefined;

      if (actionInput.photo) {
        // Create a temporary URL for preview
        photoUrl = URL.createObjectURL(actionInput.photo);
        console.log('Photo attached:', actionInput.photo.name);
      }

      if (actionInput.audioBlob) {
        // Create a temporary URL for preview
        audioUrl = URL.createObjectURL(actionInput.audioBlob);
        console.log('Audio attached:', actionInput.audioBlob.size, 'bytes');
      }

      const newAction: EcoAction = {
        id: Date.now().toString(),
        action_description: actionInput.description || 'Media attachment',
        impact_score: Math.floor(Math.random() * 5) + 1,
        action_date: new Date().toISOString().split('T')[0],
        friend_invites: 0,
        photo_url: photoUrl,
        audio_url: audioUrl
      };

      setEcoActions([newAction, ...ecoActions]);

      let attachmentText = '';
      if (actionInput.photo && actionInput.audioBlob) {
        attachmentText = ' with photo and voice note';
      } else if (actionInput.photo) {
        attachmentText = ' with photo';
      } else if (actionInput.audioBlob) {
        attachmentText = ' with voice note';
      }

      toast({
        title: "Action logged!",
        description: `You earned ${newAction.impact_score} eco points${attachmentText}!`,
      });
    } catch (error) {
      console.error('Error adding eco action:', error);
      toast({
        title: "Error",
        description: "Failed to log your eco action.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
