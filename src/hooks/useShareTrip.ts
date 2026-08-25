'use client';

import { useState, useCallback } from 'react';

interface ShareData {
  destination?: string;
  tripType?: string;
  activities?: string[];
  dates?: { start: string; end: string };
}

interface ShareTripResult {
  shareLink: string | null;
  isSharing: boolean;
  error: string | null;
  shareToNative: () => Promise<boolean>;
  generateShareLink: (data: ShareData) => Promise<string>;
}

export function useShareTrip(): ShareTripResult {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateShareLink = useCallback(async (data: ShareData) => {
    setIsSharing(true);
    setError(null);

    try {
      // Generate a unique trip ID
      const tripId = Math.random().toString(36).substring(2, 12);
      const params = new URLSearchParams();

      if (data.destination) params.set('dest', data.destination);
      if (data.tripType) params.set('type', data.tripType);
      if (data.dates?.start) params.set('start', data.dates.start);
      if (data.dates?.end) params.set('end', data.dates.end);

      const link = `${window.location.origin}/trip/${tripId}?${params.toString()}`;
      setShareLink(link);
      setIsSharing(false);
      return link;
    } catch (err) {
      setError('Failed to generate share link.');
      setIsSharing(false);
      return window.location.href;
    }
  }, []);

  const shareToNative = useCallback(async () => {
    if (!shareLink) return false;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wayfaria Trip Sharing',
          text: 'Join my trip on Wayfaria!',
          url: shareLink,
        });
        return true;
      } catch (err) {
        setError('Share failed. Link copied to clipboard instead.');
        navigator.clipboard.writeText(shareLink);
        return false;
      }
    } else {
      navigator.clipboard.writeText(shareLink);
      setError('Link copied to clipboard!');
      return false;
    }
  }, [shareLink]);

  return { shareLink, isSharing, error, shareToNative, generateShareLink };
}