# Section 2: Mobile Application (/mobile)

## Directory Structure
```
/mobile
├── components/
│   ├── LoadingSpinner.tsx
│   └── MedicationCard.tsx
├── screens/
│   ├── MedicationVerificationScreen.tsx
│   ├── InventoryScreen.tsx
│   └── DashboardScreen.tsx
├── services/
│   └── api.ts
├── config.ts
├── App.tsx
└── package.json
```

## Core Files

### 1. App.tsx
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MedicationVerificationScreen from './screens/MedicationVerificationScreen';
import InventoryScreen from './screens/InventoryScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="MedicationVerification" component={MedicationVerificationScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 2. config.ts
```typescript
// Update this with your actual API URL when deploying
export const API_URL = 'http://localhost:5000';

// Add any other configuration constants here
export const APP_VERSION = '1.0.0';

// Configuration for offline functionality
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second
```

### 3. screens/MedicationVerificationScreen.tsx
```typescript
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_URL } from '../config';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function MedicationVerificationScreen({ 
  navigation 
}: NativeStackScreenProps<any>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const verifyMedication = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a medication code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/medications/verify/${searchQuery}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter medication code"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={verifyMedication}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Text style={styles.medicationName}>{item.name}</Text>
              <Text>Manufacturer: {item.manufacturer}</Text>
              <Text>Expiry: {item.expiryDate}</Text>
              <Text style={styles.verificationStatus}>
                Status: {item.verified ? 'Verified ✓' : 'Unverified ✗'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  verificationStatus: {
    marginTop: 8,
    fontWeight: '500',
  },
});
```

### 4. components/LoadingSpinner.tsx
```typescript
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## Setup Instructions

1. Install Dependencies:
```bash
cd mobile
npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

2. Update Environment:
- Ensure your API_URL in config.ts points to your server
- For iOS: `cd ios && pod install`
- For Android: No additional steps needed

3. Run the Application:
```bash
# For iOS
npm run ios

# For Android
npm run android
```
