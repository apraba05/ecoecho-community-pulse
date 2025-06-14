
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Mic, Send, X, Camera, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EcoActionInputProps {
  onSubmit: (actionData: {
    description: string;
    photo?: File;
    audioBlob?: Blob;
  }) => void;
}

const EcoActionInput: React.FC<EcoActionInputProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please choose a photo under 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setPhoto(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      
      toast({
        title: "Photo added!",
        description: "Your photo has been attached to this action."
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Create preview URL
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
        toast({
          title: "Recording complete!",
          description: "Your voice note has been added to this action."
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Please allow microphone access to record voice notes.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const handleSubmit = () => {
    if (!description.trim() && !photo && !audioBlob) {
      toast({
        title: "Nothing to log",
        description: "Please add a description, photo, or voice note.",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      description: description.trim(),
      photo: photo || undefined,
      audioBlob: audioBlob || undefined
    });

    // Reset form
    setDescription('');
    setPhoto(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-eco-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-eco-800">Log New Eco Action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Input */}
        <div>
          <Textarea
            placeholder="Describe your eco-friendly action... (e.g., 'I biked to work today')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] border-eco-200 focus:border-eco-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {/* Photo Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-eco-300 text-eco-700 hover:bg-eco-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          </div>

          {/* Voice Recording */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            className={`border-eco-300 text-eco-700 hover:bg-eco-50 ${isRecording ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isRecording ? `Recording ${formatTime(recordingTime)}` : 'Add Voice Note'}
          </Button>
        </div>

        {/* Photo Preview */}
        {photoPreview && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Photo Preview:</h4>
            <div className="relative inline-block">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="max-w-48 max-h-32 object-cover rounded-lg border border-eco-200"
              />
              <button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {audioUrl && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Voice Note:</h4>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={playAudio}
                className="border-eco-300 text-eco-700 hover:bg-eco-50"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <span className="text-sm text-gray-600">{formatTime(recordingTime)}</span>
              <button
                onClick={removeAudio}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}

        {/* Attachments Summary */}
        {(photo || audioBlob) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Attachments:</h4>
            <div className="flex gap-2 flex-wrap">
              {photo && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Camera className="w-3 h-3 mr-1" />
                  Photo attached
                </Badge>
              )}
              {audioBlob && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Mic className="w-3 h-3 mr-1" />
                  Voice note ({formatTime(recordingTime)})
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-eco-gradient hover:bg-eco-700 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          Log Eco Action
        </Button>
      </CardContent>
    </Card>
  );
};

export default EcoActionInput;
