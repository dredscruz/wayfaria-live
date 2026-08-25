// Type definitions for browser APIs not in standard TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
  }

  interface Navigator {
    share?: (data: ShareData) => Promise<void>;
  }

  interface ShareData {
    title?: string;
    text?: string;
    url?: string;
  }
}

interface SpeechRecognitionLike {
  new (): any;
}

interface WindowLike {
  SpeechRecognition?: SpeechRecognitionLike;
  webkitSpeechRecognition?: SpeechRecognitionLike;
}

export {};