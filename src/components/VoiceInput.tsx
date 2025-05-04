
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  listening?: boolean;
  onListeningChange?: (isListening: boolean) => void;
  placeholder?: string;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  listening: externalListening,
  onListeningChange,
  placeholder = "Press the mic to speak...",
  className = "",
}) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (externalListening !== undefined) {
      setListening(externalListening);
    }
  }, [externalListening]);

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
          
        setTranscript(transcript);
        
        // If the result is final
        if (event.results[0].isFinal) {
          onResult(transcript);
          setIsProcessing(true);
          
          // Simulate processing delay for better UX feedback
          setTimeout(() => {
            setIsProcessing(false);
            setTranscript('');
            // Only auto-stop if externally controlled
            if (externalListening === undefined) {
              stopListening();
            }
          }, 1000);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Microphone error: ${event.error}`);
        stopListening();
      };
    } else {
      toast.error('Speech recognition is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
      }
      stopListening();
    };
  }, []);

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setListening(true);
        if (onListeningChange) onListeningChange(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Failed to access microphone. Please check your permissions.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setListening(false);
        if (onListeningChange) onListeningChange(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTranscript(e.target.value);
  };

  const handleSubmitEdit = () => {
    if (transcript.trim()) {
      onResult(transcript);
      setIsProcessing(true);
      
      setTimeout(() => {
        setIsProcessing(false);
        setTranscript('');
      }, 1000);
    }
  };

  return (
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <div className="relative flex-grow glass-card p-3 rounded-xl">
        <input
          type="text"
          className="w-full bg-transparent border-none focus:outline-none placeholder:text-muted-foreground"
          placeholder={listening ? "Listening..." : placeholder}
          value={transcript}
          onChange={handleInputChange}
          disabled={listening}
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl animate-fade-in">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
          </div>
        )}
      </div>
      <Button
        onClick={toggleListening}
        variant="outline"
        size="icon"
        className={`rounded-full transition-all duration-300 ${
          listening 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse' 
            : 'bg-muted hover:bg-muted/80'
        }`}
      >
        {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
      {!listening && transcript.trim() && (
        <Button
          onClick={handleSubmitEdit}
          className="rounded-md"
        >
          Apply Edit
        </Button>
      )}
    </div>
  );
};

export default VoiceInput;
