# Hollie Safety Companion App

A production-ready personal safety mobile application built with Expo (React Native) and TypeScript. Provides timed check-ins during potentially risky situations and automatically alerts trusted contacts if check-ins are missed.

## Features

- **Phone Number Authentication** - Secure OTP-based authentication via Supabase
- **Trusted Contacts Management** - Add and manage up to 5 emergency contacts
- **Pre-Session Safety Quiz** - 5 critical questions before starting a safety session
- **15-Minute Check-in Timer** - Automatic reminders with local notifications
- **GPS Location Tracking** - Captures location at check-ins and emergencies
- **Automatic Escalation** - Alerts contacts after 2 missed check-ins
- **Manual Emergency Button** - Immediate alert to all contacts
- **Twilio SMS Integration** - Sends detailed alert messages to contacts
- **Zapier Webhook Integration** - Custom integrations with HMAC signatures

## Tech Stack

- **Frontend**: Expo (React Native) + TypeScript
- **Navigation**: Expo Router
- **Backend**: Supabase (Auth + PostgreSQL)
- **Notifications**: Expo Notifications
- **Location**: Expo Location API
- **SMS**: Twilio API
- **Webhooks**: Zapier with HMAC signatures

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `EXPO_PUBLIC_TWILIO_ACCOUNT_SID` - Twilio account SID
- `EXPO_PUBLIC_TWILIO_AUTH_TOKEN` - Twilio auth token
- `EXPO_PUBLIC_TWILIO_PHONE_NUMBER` - Your Twilio phone number
- `EXPO_PUBLIC_ZAPIER_WEBHOOK_URL` - Zapier webhook URL (optional)
- `EXPO_PUBLIC_ZAPIER_WEBHOOK_SECRET` - Zapier webhook secret for HMAC (optional)

### 3. Set Up Supabase Database

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor
3. Run the SQL schema from `database/schema.sql`
4. Enable phone authentication in Authentication > Providers > Phone

### 4. Configure Twilio

1. Create a Twilio account at https://twilio.com
2. Get a phone number with SMS capabilities
3. Copy your Account SID and Auth Token
4. Add them to your `.env` file

### 5. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Database Schema

The app uses the following Supabase tables:

- `users` - User profiles (extends auth.users)
- `contacts` - Trusted emergency contacts
- `sessions` - Safety check-in sessions
- `session_events` - Events during sessions (check-ins, emergencies, etc.)
- `alerts` - Alert records
- `alert_escalations` - Escalation delivery records
- `user_settings` - User preferences (Zapier webhook config)
- `onboarding_responses` - Onboarding flow responses

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Project Structure

```
hollie/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   └── (tabs)/            # Main app tabs
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   ├── contacts/          # Contacts management
│   ├── check-in/          # Check-in system
│   ├── alerts/            # Alert system
│   └── onboarding/        # Onboarding flow
├── services/              # External service integrations
│   ├── supabase.ts        # Supabase client
│   ├── twilio.ts          # Twilio SMS
│   ├── zapier.ts          # Zapier webhooks
│   ├── notifications.ts   # Local notifications
│   └── location.ts        # Location services
├── components/            # Shared components
├── types/                 # Global TypeScript types
└── utils/                 # Utility functions
```

## Key Features Implementation

### Safety Quiz

Before starting a session, users must complete a 5-question safety quiz:
1. Where are you going?
2. Who are you meeting?
3. When do you expect to return?
4. What are you wearing?
5. Which contact should we prioritize?

This information is included in alert messages to contacts.

### Check-in System

- Sessions run with 15-minute check-in intervals
- Local notifications remind users to check in
- Missed check-ins are tracked
- After 2 missed check-ins, automatic escalation triggers

### Alert Escalation

When escalation is triggered:
1. Session status updates to "escalated"
2. SMS sent to all trusted contacts with:
   - User name and phone
   - Last known GPS location
   - Safety quiz answers
   - Missed check-in count
3. Zapier webhook fired (if configured) with HMAC signature
4. Alert record created in database

## Development

### Code Quality

- ESLint for linting
- Prettier for formatting
- Husky pre-commit hooks
- TypeScript for type safety

### Running Linters

```bash
npm run lint
npm run format
```

## Production Deployment

1. Build the app:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

2. Submit to app stores:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## Security Notes

- All API keys should be stored in environment variables
- Never commit `.env` file to version control
- Supabase RLS policies ensure data isolation
- HMAC signatures verify Zapier webhook authenticity
- Phone numbers are validated before storage

## License

Private - All rights reserved
