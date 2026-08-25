'use client';

import { useState, useCallback } from 'react';

interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
  targetLanguage: string;
}

interface LanguageTranslatorResult {
  isTranslating: boolean;
  error: string | null;
  lastTranslation: TranslationResult | null;
  translateText: (text: string, targetLang: string) => Promise<TranslationResult | null>;
}

// Map of language codes to names
export const languages = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
} as Record<string, string>;

export function useLanguageTranslator(): LanguageTranslatorResult {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTranslation, setLastTranslation] = useState<TranslationResult | null>(null);

  const translateText = useCallback(async (text: string, targetLang: string) => {
    if (!text || !targetLang) return null;

    setIsTranslating(true);
    setError(null);

    try {
      // In a real app, this would call Google Translate API or similar
      // For demo, we simulate translation
      await new Promise(resolve => setTimeout(resolve, 600));

      const targetLangName = languages[targetLang] || targetLang;
      const translatedText = `[Translated to ${targetLangName}] ${text}`;
      const detectedLanguage = 'en';

      const result: TranslationResult = {
        translatedText,
        detectedLanguage,
        targetLanguage: targetLang,
      };

      setLastTranslation(result);
      setIsTranslating(false);
      return result;
    } catch (err) {
      setError('Failed to translate text. Please check your network connection.');
      setIsTranslating(false);
      return null;
    }
  }, []);

  return { isTranslating, error, lastTranslation, translateText };
}

// Helper function for real API integration
export async function translateWithAPI(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string | null> {
  try {
    // This would be replaced with actual API call in production
    // Example using fetch to Google Translate API:
    /*
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang, sourceLang }),
    });
    const data = await response.json();
    return data.translatedText;
    */

    // Mock implementation
    const targetLangName = languages[targetLang] || targetLang;
    return `[${targetLangName}] ${text}`;
  } catch (err) {
    console.error('Translation error:', err);
    return null;
  }
}