# 🏗️ Wayfaria — Technical Architecture Document

*Version 1.0 · August 24, 2026 · By Hermes Agent*

---

## Executive Summary

This document defines the technical architecture for Wayfaria — a travel companion app that integrates weather-aware packing, voice dictation, health-adaptive planning, Google Calendar sync, affordability advising, and family group sharing.

**Core challenge**: Build a full-featured travel app that works offline, syncs in real-time, complies with health data privacy, and integrates with 10+ external APIs — all on a startup budget.

**Architecture choice**: **Next.js + Supabase + PowerSync** for offline-first sync, with a microservices API gateway for travel data aggregation.

---

## 1. Architecture Overview

### 1.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Browser / Mobile App                   │
│  Next.js Frontend (React) ┌�                                      │
│  ├─ Offline cache (IndexedDB via PowerSync)                      │
│  ├─ UI: Tailwind CSS + Framer Motion (animations)                │
│  └─ Auth: Supabase Auth Client                                    │
│                          │                                        │
│                          ▼                                        │
│           ┌──────────────────────────────┐                        │
│           │     API Gateway (Vercel)     │                       │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Auth Edge Functions  │   │                        │
│           │  │  (Google, Apple, Email)│  │                        │
│           │  └──────────────────────┘   │                        │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Trip Import         │    │                        │
│           │  │  (Email parsing,     │    │                        │
│           │  │   file upload)        │   │                        │
│           │  └──────────────────────┘   │                        │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Weather Service     │    │                        │
│           │  │  (forecast → packing)│  │                        │
│           │  └──────────────────────┘   │                        │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Calendar Sync        │   │                        │
│           │  │  (Google Calendar API)│  │                        │
│           │  └──────────────────────┘   │                        │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Booking Integrations │   │                        │
│           │  │  (Skyscanner, Amadeus)│  │                        │
│           │  └──────────────────────┘   │                        │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Translation Service  │   │                        │
│           │  │  (Google Translate)    │  │                        │
│           │  └──────────────────────┘   │                        │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Voice Processing     │   │                        │
│           │  │  (Whisper API)        │  │                        │
│           │  └──────────────────────┘   │                        │
│           └──────────────────────────────┘                        │
│                          │                                        │
│                          ▼                                        │
│           ┌──────────────────────────────┐                        │
│           │  Supabase Backend            │                       │
│           │  ┌──────────────────────┐    │                        │
│           │  │  PostgreSQL Database  │   │                        │
│           │  │  (user data, trips,    │   │                        │
│           │  │   itineraries)        │   │                        │
│           │  └──────────────────────┘   │                        │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Auth Server          │   │                        │
│           │  │  (OAuth flows)        │   │                        │
│           │  └──────────────────────┘   │                        │
│           │  ┌──────────────────────┐    │                        │
│           │  │  Realtime Engine      │   │                        │
│           │  │  (group collab)       │   │                        │
│           │  └──────────────────────┘   │                        │
│           └──────────────────────────────┘                        │
│                          │                                        │
│                          ▼                                        │
│           ┌──────────────────────────────┐                        │
│           │  PowerSync Sync Engine       │                       │
│           │  (PostgreSQL → SQLite sync)  │                       │
│           │  (offline-first)            │                       │
│           └──────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Decisions

| Decision | Choice | Rationale |
|---------|--------|-----------|
| **Frontend framework** | Next.js 15 (React) | Server components, built-in SSR, excellent DX |
| **Database** | PostgreSQL (via Supabase) | Relational data, ACID transactions, PostGIS for geography |
| **Auth** | Supabase Auth + OAuth | Built-in, supports Google/Apple/Email magic link |
| **Offline sync** | PowerSync + Supabase | True offline-first, CRDT conflict resolution |
| **Real-time** | Supabase Realtime | Built-in Postgres change streams via WebSockets |
| **Deployment** | Vercel + Supabase Edge | Global CDN, edge functions for API aggregation |
| **Voice processing** | OpenAI Whisper API | High quality, 60+ language support |
| **Translation** | Google Translate API | Best quality, offline bundles for mobile |
| **Weather** | Tomorrow.io + WeatherAPI | High-resolution forecasting, global coverage |
| **Flight/hotel data** | Skyscanner + Amadeus | Skyscanner for price comparison, Amadeus for booking |
| **Calendar** | Google Calendar API v3 | Most reliable, widely adopted |

### 1.3 Why PowerSync + Supabase (Not Firebase)

Based on research from February 2026:
- **Firebase Firestore**: Mature offline persistence, but NoSQL doesn't model relational trip data well (trip → days → activities → packing items)
- **Supabase**: SQL-first, perfect relational model. But lacks built-in offline persistence
- **PowerSync**: Bridges the gap — syncs PostgreSQL → SQLite on the client, handles conflict resolution via CRDTs

**Trade-off**: PowerSync is newer (2024-2026), smaller community than Firebase. But the relational data model fit is critical for Wayfaria's nested trip structure.

---

## 2. API Integration Plan

### 2.1 Authentication Stack

| Provider | Use Case | Cost | Notes |
|----------|----------|------|-------|
| **Supabase Auth** | Primary auth system | Free (up to 50K MAU) | Handles OAuth flows |
| **Google OAuth 2.0** | Google sign-in | Free | Need GOOGLE_CLIENT_ID/SECRET |
| **Apple Sign In** | Apple sign-in | Free | Need Apple Developer account |
| **Email magic link** | Passwordless login | Free (Supabase managed) | SendGrid integration required |

**Implementation**: Users start planning without signing in. All data is stored in localStorage first. When they sign in, data merges into their account via a deterministic merge strategy (conflict resolution by timestamp).

### 2.2 Travel Data APIs

**🚨 CRITICAL UPDATE (July 2026)**: Amadeus shut down their self-service developer portal. No free tier for independent developers. Enterprise contracts now required.

| API | Purpose | Free Tier | Paid | Integration Complexity |
|-----|---------|-----------|------|----------------------|
| **Skyscanner** | Flight search & price tracking | No public free tier | Commercial agreement required | Medium — requires partner approval |
| **Google QPX Express** | Flight search (deprecated) | N/A | Discontinued | Switch to: Skyscanner or Kiwi |
| **Kiwi.com API** | Flight search | 1000 requests/month free | $0.01/request after | Easy — REST API |
| **Amadeus (Enterprise)** | Flight + hotel booking | Enterprise only (no free tier) | $10K+/month minimum | High — requires IATA accreditation |
| **Booking.com API** | Hotel search | Requires affiliate account | Commission-based | Medium — XML, complex |
| **GetYourGuide API** | Activities & experiences | Free for testing | Commission on bookings | Medium — needs approval |
| **TripAdvisor API** | Reviews & photos | Limited free tier | Paid for full access | Medium |
| **OpenWeatherMap** | Current conditions | 1,000 calls/day free | $0.0002/call | Easy — REST |
| **Tomorrow.io** | Hyperlocal forecasts | 500 calls/day free | $1/day per 1000 calls | Medium — requires API key |
| **WeatherAPI** | 14-day forecast | 1M/month free | $0.0005/call | Easy — REST |

**Recommended API stack**:
- **Kiwi.com** for flight search (has free tier for startups)
- **Booking.com** for hotels (affiliate program, no upfront cost)
- **GetYourGuide** for activities
- **WeatherAPI** + **Tomorrow.io** for weather (redundancy)

### 2.3 Google Calendar Integration

Based on Nango.dev research (February 2026):

```
Google Calendar Sync Flow:
1. User grants OAuth scope: https://www.googleapis.com/auth/calendar.events
2. App creates/modify events with structured data:
   - Summary: "Day 3: Fushimi Inari Shrine"
   - Description: Full itinerary details
   - Start/End: Timestamps
   - Location: Address
   - Extended properties: trip_id, activity_id, weather_note
3. Real-time sync via Google Push Notifications:
   - Google sends webhook → app triggers incremental sync
   - Uses sync tokens to only fetch changed events
4. Conflict resolution: Last-write-wins with user-facing merge UI
```

**Implementation approach**: Use [Nango](https://nango.dev) for pre-built Google Calendar integration (handles OAuth, webhooks, rate limits). Falls back to manual integration if Nango costs become prohibitive.

### 2.4 Voice Processing (Whisper API)

```
Voice Dictation Flow:
1. User taps mic → records audio locally (Web Audio API)
2. Audio streamed to OpenAI Whisper API (whisper-1)
3. Whisper returns text + detected language
4. Text sent to itinerary parser (custom NLP + structured extraction)
5. Parsed itinerary previewed for user confirmation before saving
```

**Cost**: $0.006/minute (whisper-1). A 30-second dictation costs $0.03.

**Fallback**: Web Speech API (browser-native) for basic dictation without external cost.

### 2.5 Translation Service

```
Translation Integration:
1. Google Translate API v3 for online mode
2. Offline bundles via Google Cloud Translate SDK for mobile
3. Cached translations stored in SQLite via PowerSync
4. Per-trip language pack: auto-download phrases for destination
```

**Cost**: $20 per 1M characters.

### 2.6 Weather Integration

```
Weather Data Flow:
1. WeatherAPI.com → 14-day forecast (free tier covers MVP)
2. Tomorrow.io → hyperlocal alerts (rain start time, UV index)
3. Forecast linked to each day in itinerary
4. Packing suggestions auto-update when forecast changes
5. Real-time push notifications for weather alerts via Expo/APNs/FCM
```

### 2.7 Email Import (TripIt Alternative)

Based on research showing Tineo as the best TripIt alternative:

```
Email Import Flow:
1. User grants Gmail read access (OAuth scope: gmail.readonly)
2. App scans inbox for travel confirmations (flights, hotels, cars)
3. NLP parser extracts: dates, times, confirmation numbers, addresses
4. Creates structured itinerary in Wayfaria
5. User can edit/confirm before saving

Libraries:
- python-email-parser (for email parsing logic)
- Node.js: mailparser npm package
- Hosted on Vercel Edge Function with gmail API integration
```

### 2.8 AI Cost Prediction & Booking Suggestions

```
Affordability Calculator Integration:
1. Tripadvisor/Booking.com API for hotel price ranges by date
2. Kiwi/Skyscanner for flight price trends
3. Google Places API for restaurant pricing ($$$) tiers
4. ML model (hosted) predicts total trip cost
5. Savings recommendations:
   - "Move trip 3 days earlier → save $340"
   - "Consider Tuesday departure → save $180"
   - "Alternative hotel: $120/night cheaper"
6. Price lock alerts when prices drop
```

---

## 3. Database Schema Design

All data stored in PostgreSQL via Supabase:

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    preferences JSONB  -- Language, currency, units
);

-- Health profiles (HEALTH DATA — see compliance section)
CREATE TABLE user_health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    age INTEGER,
    mobility_level TEXT CHECK (mobility_level IN ('full', 'limited_walking', 'wheelchair', 'custom')),
    mobility_details TEXT,
    dietary_restrictions TEXT[],  -- ['diabetic', 'low_sodium', 'vegetarian']
    medical_conditions TEXT[],    -- ['heart_condition', 'arthritis', 'none']
    emergency_contact JSONB,     -- {name, phone, relationship}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Health data is encrypted at rest via Supabase column-level encryption
    -- Access is restricted via RLS: only the user can read their health profile
);

-- Trips
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title TEXT,
    description TEXT,
    destination JSONB,  -- {city, country, lat, lng}
    start_date DATE,
    end_date DATE,
    currency TEXT DEFAULT 'USD',
    budget DECIMAL(10,2),
    budget_used DECIMAL(10,2) DEFAULT 0,
    status TEXT CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),
    is_public BOOLEAN DEFAULT FALSE,
    share_token TEXT UNIQUE,  -- For public links
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trip members (group sharing)
CREATE TABLE trip_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    role TEXT CHECK (role IN ('owner', 'editor', 'viewer', 'child')) DEFAULT 'viewer',
    -- Age/health awareness: child role gets special itinerary filtering
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

-- Trip days
CREATE TABLE trip_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER,
    date DATE,
    title TEXT,
    weather_forecast JSONB,  -- {high, low, condition, icon}
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_day_id UUID REFERENCES trip_days(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    category TEXT CHECK (category IN ('sightseeing', 'food', 'transport', 'accommodation', 'activity', 'other')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    location JSONB,  -- {lat, lng, address, name}
    booking_info JSONB,  -- {provider, confirmation, url, price}
    health_notes TEXT[],  -- Auto-generated based on health profile
    weather_notes TEXT,   -- Weather dependency notes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Packing items
CREATE TABLE packing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('clothing', 'gear', 'toiletries', 'documents', 'electronics', 'medications', 'other')),
    item_name TEXT,
    is_checked BOOLEAN DEFAULT FALSE,
    is_weather_important BOOLEAN DEFAULT FALSE,
    weather_reason TEXT,  -- e.g., "Rain expected Days 2-3"
    is_activity_match BOOLEAN DEFAULT FALSE,
    activity_match_reason TEXT,  -- e.g., "Smart shoes for fine dining Day 4"
    assigned_to_user_id UUID REFERENCES users(id),  -- For group packing
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Calendar sync
CREATE TABLE calendar_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    trip_id UUID REFERENCES trips(id),
    google_calendar_id TEXT,
    google_event_id TEXT,
    sync_enabled BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    trip_id UUID REFERENCES trips(id),
    type TEXT CHECK (type IN ('weather', 'disruption', 'group_update', 'reminder', 'price_drop')),
    title TEXT,
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,  -- Deep link into app
    created_at TIMESTAMP DEFAULT NOW()
);

-- Saved translations (offline)
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id),
    user_id UUID REFERENCES users(id),
    original_text TEXT,
    translated_text TEXT,
    source_language TEXT,
    target_language TEXT,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Cache key for deduplication
    UNIQUE(trip_id, original_text, source_language, target_language)
);

-- Affordability savings
CREATE TABLE savings_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id),
    type TEXT CHECK (type IN ('flight', 'hotel', 'activity', 'timing', 'overall')),
    recommendation_text TEXT,
    potential_savings DECIMAL(10,2),
    currency TEXT,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trip imports (from email, TripIt, etc.)
CREATE TABLE trip_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    source TEXT CHECK (source IN ('gmail', 'tripit', 'manual', 'file_upload')),
    raw_data JSONB,  -- Parsed email content or file
    status TEXT CHECK (status IN ('pending', 'parsed', 'confirmed', 'failed')),
    parsed_data JSONB,  -- Structured itinerary
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);
```

### Row Level Security (RLS) Policies

Critical for multi-user trip sharing and health data protection:

```sql
-- Users can only read their own health profiles
CREATE POLICY "Users can view own health profile"
ON user_health_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Trip members can read trips they belong to
CREATE POLICY "Trip members can read trips"
ON trips FOR SELECT
TO authenticated
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM trip_members 
    WHERE trip_members.trip_id = trips.id 
    AND trip_members.user_id = auth.uid()
));

-- Only trip owner can delete trips
CREATE POLICY "Only owner can delete trips"
ON trips FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Trip members can read activities for their trips
CREATE POLICY "Trip members can read activities"
ON activities FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM trip_days 
    JOIN trips ON trips.id = trip_days.trip_id
    JOIN trip_members ON trip_members.trip_id = trips.id
    WHERE trip_members.user_id = auth.uid()
    AND trip_days.id = activities.trip_day_id
));
```

---

## 4. API Gateway Design (Vercel Edge Functions)

### 4.1 Edge Function Endpoints

```typescript
// /api/edge/weather-sync
// Runs every 15 minutes, checks weather forecasts, updates packing lists
export async function GET(req: Request) {
    // Check if weather changed for any trip in next 14 days
    // If significant change, update packing items + send notifications
    return new Response(JSON.stringify({ updated: tripsUpdated }));
}

// /api/edge/trip-import
// Email parsing endpoint — receives Gmail webhook, parses confirmations
export async function POST(req: Request) {
    const { email } = await req.json();
    // Parse email → extract booking details
    // Create trip_imports record → notify user for confirmation
    return new Response(JSON.stringify({ parsed: itinerary }));
}

// /api/edge/calendar-sync
// Two-way Google Calendar sync
export async function POST(req: Request) {
    const { userId, action, eventId, eventData } = await req.json();
    // Handle: create, update, delete, sync
    return new Response(JSON.stringify({ success: true }));
}

// /api/edge/voice-transcribe
// Whisper API integration for voice dictation
export async function POST(req: Request) {
    const { audioBlob, language } = await req.json();
    // Stream to OpenAI Whisper
    // Return transcribed text + detected language
    return new Response(JSON.stringify({ text, language }));
}

// /api/edge/affordability-check
// Run cost analysis for a trip, generate savings recommendations
export async function POST(req: Request) {
    const { tripId } = await req.json();
    // Check flight prices (Kiwi), hotel prices (Booking.com)
    // Run ML model for predictions
    // Generate savings_recommendations
    return new Response(JSON.stringify({ recommendations }));
}
```

### 4.2 Scheduled Cron Jobs

```typescript
// Daily: weather forecast → packing list refresh
// Trigger: Vercel Cron at 2:00 AM UTC
// Runs weather check for all trips with start_date within 14 days

// Hourly: flight status monitoring
// Checks all activities with flight bookings
// Sends disruption notifications via push

// Weekly: price drop alerts
// Scans Kiwi/Booking.com for better deals on upcoming trips
// Sends price drop notifications
```

---

## 5. Offline-First Architecture

### 5.1 PowerSync Integration

Based on February 2026 research:

```
PowerSync Sync Flow:
1. Server: PostgreSQL (Supabase) with PowerSync stack deployed
2. Client: SQLite local database with PowerSync client SDK
3. Sync: Bidirectional sync via PowerSync Cloud
4. Conflict resolution: Last-write-wins with merge function
5. Data scoping: Only sync trips the user is a member of

Local schema mirrors server schema exactly.
All writes go to local SQLite first → synced to server when online.
```

### 5.2 Data Prioritization

| Feature | Offline Priority | Sync Required |
|---------|-----------------|---------------|
| Itinerary view | High | No |
| Add/edit activities | High | No |
| Packing checklist | High | No |
| Weather forecast | Medium | Yes (needs network) |
| Flight status | Low | Yes |
| Calendar sync | Low | Yes |
| Voice dictation | Low | Yes (processing) |
| Translation | Medium | Yes (for new translations) |

### 5.3 Conflict Resolution Strategy

1. **Local writes always succeed** — no blocking on network
2. **Server reconciliation** — PowerSync CRDT handles merge
3. **User-facing conflict UI** — when conflicts can't be auto-resolved, show merge screen
4. **Health data** — extra cautious: conflicts require user confirmation before merge

---

## 6. Health Data Compliance

### 6.1 Regulatory Framework

Based on research from Usercentrics, Drata, and HHS:

**GDPR (Global)**:
- Health data is "special category data" under Article 9
- Requires **explicit consent** (not just general ToS agreement)
- Must provide data portability and right to erasure
- Data minimization: only collect what's necessary

**HIPAA (US)**:
- Applies to "covered entities" (healthcare providers, insurers) and their "business associates"
- Travel app is likely a **business associate** if storing health data
- Requires Business Associate Agreement (BAA) with Supabase
- Must implement administrative, physical, and technical safeguards

**CCPA (California)**:
- Health data classified as "sensitive personal information"
- Right to delete, right to opt-out of sale
- Must disclose categories of health data collected

### 6.2 Implementation Requirements

```
Health Data Handling:
1. EXPLICIT CONSENT: Separate consent screen for health data collection
   "I understand that Wayfaria will use my health information to adapt 
    trip recommendations. This includes age, mobility, dietary needs, 
    and medical conditions."
   
2. DATA MINIMIZATION: Only collect what affects trip planning:
   - Age (affects pace, activity intensity)
   - Mobility (affects terrain, distance per day)
   - Dietary (affects restaurant recommendations)
   - Medical conditions (affects proximity to hospitals, activity risk)

3. ENCRYPTION: 
   - Column-level encryption for health_profile table
   - TLS 1.3 for all API transport
   - Local storage encrypted via Web Crypto API on client

4. ACCESS CONTROL:
   - RLS: Only the user can read their own health profile
   - API endpoints require authentication + health data scope
   - Audit log of all health data access

5. DATA DELETION:
   - Health data deleted within 24 hours of account deletion
   - Option for selective deletion (remove health data, keep trip data)

6. BAA: Supabase offers HIPAA BAA for Enterprise plan
   → Need to upgrade when health features move to production
```

### 6.3 Data We Do NOT Collect

- Specific medical record numbers
- Insurance information
- Prescription details
- Mental health history
- Genetic information

---

## 7. Real-Time Sync Architecture

### 7.1 Group Collaboration

```
Realtime Flow:
1. User A edits activity "Day 3: Fushimi Inari"
2. Supabase Realtime sends WebSocket message to all connected clients
3. User B's client receives update → updates local SQLite via PowerSync
4. If User B is offline → update queued → synced when online
5. Conflict: last-write-wins (timestamp-based)
```

### 7.2 Google Calendar Two-Way Sync

```
Sync Strategy (based on Nango research):
1. Initial full sync: Fetch all user events from Google Calendar
2. Store mapping: {wayfaria_event_id: google_event_id}
3. Realtime: Google sends push notification → webhook → incremental sync
4. Local changes: Queued via PowerSync → synced to Google when online
5. Conflict resolution: Google Calendar wins (external source of truth)
```

---

## 8. Cost Analysis (Monthly at Scale)

| Service | Free Tier | Paid Tier (Est.) | MVP Cost | Production Cost |
|---------|-----------|------------------|----------|-----------------|
| Supabase | $25/mo (500MB) | Pro: $25-$499/mo | $25 | $99+ |
| PowerSync | $0 (100 users) | $49-$499/mo | $0 | $99 |
| Vercel | $0 (limited) | $20-$499/mo | $0 | $79 |
| OpenAI Whisper | $0 (limited) | $0.006/min | $20 | $500+ |
| Google Translate | $0 (100K chars) | $20/1M chars | $0 | $100 |
| WeatherAPI | $0 (1M calls) | $7/1M calls | $0 | $49 |
| Tomorrow.io | $0 (500 calls) | $1/day/1K calls | $0 | $150 |
| Google Calendar API | $0 | $0 (no cost) | $0 | $0 |
| Gmail API | $0 | $0 (no cost) | $0 | $0 |
| Kiwi.com Flights | $0 (1000 req) | $0.01/req | $0 | $2000+ |
| Booking.com | $0 (affiliate) | Commission-based | $0 | $0 (rev-share) |

**MVP Total**: ~$25/month (mostly Supabase free tier)
**Production (10K users)**: ~$3,000/month

---

## 9. Deployment Architecture

### 9.1 CI/CD Pipeline

```
GitHub Actions:
1. Push to main → runs tests → deploys to Vercel (preview)
2. Push to main with [deploy] → runs full test suite → deploys to production
3. Nightly: security audits (npm audit, snyk)
4. Weekly: integration tests with real APIs (Skyscanner, WeatherAPI)

Vercel Configuration:
- Edge Functions for API endpoints
- SSG for static pages (landing, marketing)
- ISR for dynamic pages (trip pages)
- Image Optimization for destination photos
```

### 9.2 Monitoring & Observability

| Tool | Purpose | Cost |
|------|---------|------|
| **Sentry** | Error tracking | Free (5K events/mo) |
| **PostHog** | Product analytics | Free (1M events) |
| **Datadog** | Infrastructure monitoring | $15+/host |
| **Supabase Logs** | Database query logs | Included in Pro |
| **Vercel Analytics** | Performance monitoring | $0-50/mo |

---

## 10. Implementation Roadmap

### Phase 1: Core MVP (Months 1-3)
1. Authentication (Google, Apple, email magic link)
2. Trip creation + day-by-day planning
3. Map integration (Mapbox GL)
4. Offline-first storage (PowerSync + SQLite)
5. Real-time group collaboration
6. Weather-aware packing (WeatherAPI only)

### Phase 2: API Integrations (Months 3-6)
1. Voice dictation (Whisper API)
2. Email import (Gmail API + NLP parser)
3. Google Calendar sync (Calendar API + Nango)
4. Language translator (Google Translate API)
5. Health & age-aware planning (initial schema)
6. Affordability calculator (price comparison APIs)

### Phase 3: Advanced Features (Months 6-9)
1. Flight price tracking (Kiwi API)
2. Hotel recommendations (Booking.com API)
3. Activity booking (GetYourGuide API)
4. Entry requirements integration
5. Accessibility features
6. Mobile apps (React Native)

### Phase 4: Scale & Compliance (Months 9-12)
1. Health data compliance (HIPAA BAA, GDPR consent)
2. Price prediction ML model
3. Disruption co-pilot (flight monitoring)
4. Points optimizer
5. Community features
6. WhatsApp/Instagram integration

---

## 11. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **APIs cost too much** | Start with free tiers, implement caching, lazy loading |
| **Offline sync conflicts** | PowerSync CRDT, user-facing merge UI for health data |
| **Health liability** | Disclaimers, recommend professional medical advice, data minimization |
| **Calendar sync bugs** | Two-way sync with manual override, conflict resolution UI |
| **Voice transcription errors** | User confirmation step before saving parsed itinerary |
| **Translation accuracy** | User-editable translations, feedback loop for corrections |
| **Weather data gaps** | Multiple providers (WeatherAPI + Tomorrow.io), graceful degradation |
| **Flight API shutdown** | Like Amadeus (July 2026), have fallback APIs (Kiwi, Skyscanner) |
| **Health data breach** | Column-level encryption, RLS policies, regular security audits |

---

## 12. Next Steps

This architecture is ready for implementation. Recommended starting point:

1. **Week 1**: Set up Supabase project + PowerSync, deploy DB schema with RLS policies
2. **Week 2**: Build auth flow in Next.js + deploy to Vercel
3. **Week 3**: Implement offline-first trip CRUD with PowerSync sync
4. **Week 4**: Add weather API integration + packing list generation
5. **Week 5-6**: Voice dictation + email import MVP
6. **Week 7-8**: Google Calendar sync + group sharing
7. **Week 9-10**: Health profile + affordability calculator
8. **Week 11-12**: Testing + health data compliance documentation

---

*Prepared by Hermes Agent · August 24, 2026*
*Based on research: Amadeus API changes (July 2026), PowerSync documentation, Nango Google Calendar sync guide, HIPAA/GDPR compliance frameworks, and travel API comparison guides.*