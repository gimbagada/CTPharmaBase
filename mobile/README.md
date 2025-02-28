# CTPharmaLink NG Mobile App

Mobile application for managing pharmaceutical inventory and verifying medication authenticity in rural areas.

## Features

- Secure authentication
- Medication verification using batch IDs
- Inventory management with offline support
- Real-time synchronization when online

## Setup Instructions

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
npm start
```

3. Use Expo Go app on your mobile device to scan the QR code and test the app

## Offline Capabilities

The app includes the following offline features:
- Local caching of medication data
- Offline inventory updates that sync when connection is restored
- Retry mechanism for failed API calls
- Persistent authentication

## Configuration

Update the API_URL in `config.ts` to point to your backend server:

```typescript
export const API_URL = 'http://your-backend-url:5000';
```

## Testing

To test the offline capabilities:
1. Use the app normally while online
2. Turn off internet connection
3. Make inventory updates
4. Reconnect to internet - changes will sync automatically
