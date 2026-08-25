'use client';

import { useState, useCallback, useEffect } from 'react';

interface VoiceDictationResult {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

export function useVoiceDictation(): VoiceDictationResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recog = new SpeechRecognitionAPI();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          setIsListening(false);
        }
      };

      recog.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
      recog.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError('Failed to start speech recognition. Please check microphone permissions.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, [recognition]);

  return { isListening, transcript, error, startListening, stopListening };
}

// Fallback for when SpeechRecognition isn't available
class SpeechRecognition {}