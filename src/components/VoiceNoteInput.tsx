import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceNoteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function VoiceNoteInput({ value, onChange, placeholder }: VoiceNoteInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'it-IT'; // Italian by default

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          // Append the final transcript to the existing value
          const newValue = value ? `${value} ${finalTranscript}` : finalTranscript;
          onChange(newValue);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Permesso microfono negato. Consenti l\'accesso per usare questa funzione.');
        } else {
          setError(`Errore: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Riconoscimento vocale non supportato da questo browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [value, onChange]);

  const toggleListening = () => {
    setError(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error("Failed to start recognition:", e);
        }
      } else {
        setError('Riconoscimento vocale non supportato.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Inserisci note o usa il microfono per dettare..."}
          className="w-full text-xs md:text-sm p-3 bg-black/20 text-white border border-white/10 rounded-xl outline-none focus:border-cyan-500/50 min-h-[100px] resize-none pr-12 custom-scrollbar"
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all flex items-center justify-center ${
            isListening 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse border border-red-500/30' 
              : 'bg-white/5 text-slate-400 hover:text-cyan-400 hover:bg-white/10 border border-white/10'
          }`}
          title={isListening ? "Ferma dettatura" : "Avvia dettatura vocale"}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>
      
      {error && (
        <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
      {isListening && !error && (
        <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-bold">
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          In ascolto...
        </div>
      )}
    </div>
  );
}
