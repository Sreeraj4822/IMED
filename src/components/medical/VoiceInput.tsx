"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showError = (message: string) => {
    setError(message);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setError(null);
    }, 4000);
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showError("Voice not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      recognition.stop();
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);

      console.log("Speech error:", event.error);

      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          showError("Microphone permission denied.");
          break;

        case "no-speech":
          showError("No speech detected. Try again.");
          break;

        case "audio-capture":
          showError("Microphone not found.");
          break;

        case "network":
          showError("Speech service unavailable. Try again.");
          break;

        default:
          showError("Voice input failed.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

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
    if (!recognitionRef.current) {
      showError("Voice not supported.");
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.warn("Speech start error:", err);
      setIsListening(false);
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
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
          Listening...
        </div>
      )}

      {error && !isListening && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-destructive text-white px-2 py-0.5 rounded text-[10px] font-bold animate-in fade-in zoom-in-95 shadow-lg">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}