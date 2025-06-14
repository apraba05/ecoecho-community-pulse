
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Mic, Send, X, Camera, Play, Pause, Bot, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  photo?: string;
  audioUrl?: string;
  timestamp: Date;
}

const EcoAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please choose a photo under 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setPhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
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
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

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

  const simulateAIResponse = (userMessage: string): string => {
    const responses = [
      "That's a great eco-friendly choice! Based on your activity, I'd suggest tracking your carbon footprint reduction.",
      "Your commitment to sustainability is inspiring! Have you considered documenting the environmental impact of this action?",
      "Excellent question! For eco activities like this, I recommend measuring the long-term benefits and sharing with your community.",
      "That's an interesting approach to environmental conservation. You might want to explore similar actions that could amplify your impact.",
      "Great eco initiative! Consider setting up a routine around this activity to maximize your environmental contribution."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSubmit = async () => {
    if (!inputText.trim() && !photo && !audioBlob) {
      toast({
        title: "Nothing to send",
        description: "Please add a message, photo, or voice note.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim() || 'Shared media attachment',
      photo: photoPreview || undefined,
      audioUrl: audioUrl || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: simulateAIResponse(inputText),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);

    // Reset form
    setInputText('');
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
        <CardTitle className="text-lg text-eco-800 flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span>Eco Assistant</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Ask questions about your eco activities or get suggestions for sustainable living</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Display */}
        {messages.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-eco-500 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center space-x-1 mb-1">
                    {message.type === 'user' ? (
                      <User className="w-3 h-3" />
                    ) : (
                      <Bot className="w-3 h-3 text-eco-600" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.type === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  {message.photo && (
                    <img 
                      src={message.photo} 
                      alt="Attached" 
                      className="mt-2 max-w-32 max-h-24 object-cover rounded border"
                    />
                  )}
                  {message.audioUrl && (
                    <div className="mt-2">
                      <audio controls className="w-full max-w-48">
                        <source src={message.audioUrl} type="audio/wav" />
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-1 mb-1">
                    <Bot className="w-3 h-3 text-eco-600" />
                    <span className="text-xs opacity-75">Assistant</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-eco-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-eco-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-eco-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Input */}
        <div>
          <Textarea
            placeholder="Ask me about eco activities, get sustainability tips, or share your environmental questions..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[80px] border-eco-200 focus:border-eco-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
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
          disabled={isLoading}
          className="w-full bg-eco-gradient hover:bg-eco-700 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          {isLoading ? 'Thinking...' : 'Ask Assistant'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EcoAssistant;
