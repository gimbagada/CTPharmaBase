import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, RETRY_ATTEMPTS, RETRY_DELAY } from '../config';

interface ApiOptions {
  method?: string;
  body?: any;
  requiresAuth?: boolean;
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, requiresAuth = true } = options;

  // Check for internet connectivity
  if (!await isOnline()) {
    throw new Error('No internet connection');
  }

  // Retry logic for poor connectivity
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: requiresAuth ? 'include' : 'omit',
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === RETRY_ATTEMPTS) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
}

// Queue for storing offline operations
interface QueuedOperation {
  endpoint: string;
  options: ApiOptions;
  timestamp: number;
}

export const syncQueue = {
  async add(operation: QueuedOperation) {
    const queue = await this.getQueue();
    queue.push(operation);
    await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
  },

  async getQueue(): Promise<QueuedOperation[]> {
    const queue = await AsyncStorage.getItem('syncQueue');
    return queue ? JSON.parse(queue) : [];
  },

  async process() {
    const queue = await this.getQueue();
    const failedOperations: QueuedOperation[] = [];

    for (const operation of queue) {
      try {
        await apiRequest(operation.endpoint, operation.options);
      } catch (error) {
        failedOperations.push(operation);
      }
    }

    // Save failed operations back to queue
    await AsyncStorage.setItem('syncQueue', JSON.stringify(failedOperations));
    return failedOperations.length === 0;
  },
};

// Utility to check internet connectivity
async function isOnline(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Cache management
export const cache = {
  async set(key: string, data: any, expiry: number = CACHE_EXPIRY) {
    const item = {
      data,
      timestamp: Date.now(),
      expiry,
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  },

  async get(key: string) {
    const item = await AsyncStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp, expiry } = JSON.parse(item);
    if (Date.now() - timestamp > expiry) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data;
  },

  async clear(key: string) {
    await AsyncStorage.removeItem(key);
  },
};
