'use client';

import { useState, useCallback } from 'react';

interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end?: { dateTime: string; timeZone?: string };
}

interface CalendarSyncResult {
  isSyncing: boolean;
  error: string | null;
  lastSynced: Date | null;
  syncToCalendar: (events: CalendarEvent[]) => Promise<boolean>;
  authorize: () => Promise<void>;
}

export function useCalendarSync(): CalendarSyncResult {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const authorize = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Try to use Google Identity Services
    try {
      setError(null);
      // Store auth state in localStorage for demo
      localStorage.setItem('calendar-auth', 'pending');
    } catch (err) {
      setError('Failed to authorize calendar access.');
    }
  }, []);

  const syncToCalendar = useCallback(async (events: CalendarEvent[]) => {
    setIsSyncing(true);
    setError(null);

    try {
      // In a real app, this would call the Google Calendar API
      // For demo purposes, we simulate the sync
      await new Promise(resolve => setTimeout(resolve, 1200));

      const auth = localStorage.getItem('calendar-auth');
      if (!auth) {
        throw new Error('Calendar authorization required.');
      }

      // Simulate successful sync
      console.log('[Calendar Sync] Events synced:', events.length);
      setLastSynced(new Date());
      setIsSyncing(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync with calendar.');
      setIsSyncing(false);
      return false;
    }
  }, []);

  return { isSyncing, error, lastSynced, syncToCalendar, authorize };
}

// Helper to generate calendar events from a trip
export function generateCalendarEvents(trip: {
  destination: string;
  dates: { start: string; end: string };
  activities: string[];
}): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const startDate = new Date(trip.dates.start);
  const endDate = new Date(trip.dates.end);

  // Add trip range event
  events.push({
    summary: `Wayfaria Trip to ${trip.destination}`,
    description: `Trip to ${trip.destination}\nActivities: ${trip.activities.join(', ')}`,
    start: { dateTime: trip.dates.start, timeZone: 'UTC' },
    end: { dateTime: trip.dates.end, timeZone: 'UTC' },
  });

  // Add individual activity events
  trip.activities.forEach((activity, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    events.push({
      summary: activity,
      description: `Activity in ${trip.destination}`,
      start: {
        dateTime: new Date(date.setHours(9, 0, 0)).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(date.setHours(17, 0, 0)).toISOString(),
        timeZone: 'UTC',
      },
    });
  });

  return events;
}