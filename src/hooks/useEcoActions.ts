
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [ecoActions, setEcoActions] = useState<EcoAction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEcoActions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eco_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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

  const uploadFile = async (file: File | Blob, bucket: string, fileName: string): Promise<string | null> => {
    try {
      const filePath = `${user?.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return null;
    }
  };

  const addEcoAction = async (actionInput: EcoActionInput) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to log eco actions.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      let photoUrl: string | undefined;
      let audioUrl: string | undefined;

      // Upload photo if provided
      if (actionInput.photo) {
        const fileName = `photo_${Date.now()}.${actionInput.photo.name.split('.').pop()}`;
        photoUrl = await uploadFile(actionInput.photo, 'eco-photos', fileName) || undefined;
        console.log('Photo uploaded:', photoUrl);
      }

      // Upload audio if provided
      if (actionInput.audioBlob) {
        const fileName = `audio_${Date.now()}.webm`;
        audioUrl = await uploadFile(actionInput.audioBlob, 'eco-audio', fileName) || undefined;
        console.log('Audio uploaded:', audioUrl);
      }

      const newActionData = {
        user_id: user.id,
        action_description: actionInput.description || 'Media attachment',
        impact_score: Math.floor(Math.random() * 5) + 1,
        action_date: new Date().toISOString().split('T')[0],
        friend_invites: 0,
        photo_url: photoUrl,
        audio_url: audioUrl
      };

      const { data, error } = await supabase
        .from('eco_actions')
        .insert([newActionData])
        .select()
        .single();

      if (error) throw error;

      // Add to local state immediately for instant UI update
      setEcoActions(prevActions => [data, ...prevActions]);

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
        description: `You earned ${data.impact_score} eco points${attachmentText}!`,
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

  useEffect(() => {
    fetchEcoActions();
  }, [user]);

  // Set up real-time subscription for new actions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('eco_actions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'eco_actions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New eco action received:', payload);
          // Only add if it's not already in the list (to avoid duplicates from our manual addition)
          setEcoActions(prevActions => {
            const exists = prevActions.some(action => action.id === payload.new.id);
            if (!exists) {
              return [payload.new as EcoAction, ...prevActions];
            }
            return prevActions;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    ecoActions,
    loading,
    addEcoAction,
    refetch: fetchEcoActions
  };
};
