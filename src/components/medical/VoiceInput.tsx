"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearErrorWithTimeout = (message: string) => {
    setError(message);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setError(null);
    }, 5000);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          onTranscript(transcript);
          setIsListening(false);
        }
      };

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        switch (event.error) {
          case 'network':
            clearErrorWithTimeout('Network issue. Check connection.');
            break;
          case 'not-allowed':
          case 'service-not-allowed':
            clearErrorWithTimeout('Mic access denied.');
            break;
          case 'no-speech':
            clearErrorWithTimeout('No speech detected.');
            break;
          case 'aborted':
            break;
          default:
            clearErrorWithTimeout('Speech error. Try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError('Not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!navigator.onLine) {
      clearErrorWithTimeout('You are offline.');
      return;
    }

    if (!recognitionRef.current) {
      clearErrorWithTimeout('Browser not supported.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-2 relative", className)}>
      <Button
        type="button"
        variant={isListening ? "destructive" : "secondary"}
        size="icon"
        className={cn(
          "rounded-full h-10 w-10 transition-all duration-300 shadow-sm relative z-10",
          isListening && "animate-pulse ring-4 ring-destructive/20"
        )}
        onClick={toggleListening}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      
      {isListening && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-top-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
          Listening
        </div>
      )}

      {error && !isListening && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-destructive text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap animate-in fade-in zoom-in-95 shadow-lg">
          {error.includes('Network') || error.includes('offline') ? <WifiOff className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {error}
        </div>
      )}
    </div>
  );
}