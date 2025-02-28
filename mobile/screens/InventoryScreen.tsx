import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_URL, RETRY_ATTEMPTS, RETRY_DELAY } from '../config';
import { LoadingScreen } from '../components/LoadingScreen';
import { LoadingIndicator } from '../components/LoadingIndicator';

type RootStackParamList = {
  Inventory: undefined;
  Dashboard: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Inventory'>;

interface User {
  id: number;
  username: string;
  role: string;
}

interface Medication {
  id: number;
  name: string;
  manufacturer: string;
  batchId: string;
}

interface InventoryItem {
  id: number;
  pharmacyId: number;
  medicationId: number;
  quantity: number;
}

export default function InventoryScreen({ navigation }: Props) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserData();
    fetchMedications();
    fetchInventory();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const retryFetch = async (
    fetchFunction: () => Promise<Response>,
    attempts: number = RETRY_ATTEMPTS
  ): Promise<Response> => {
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetchFunction();
        if (response.ok) return response;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
      }
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    throw new Error('Failed after retry attempts');
  };

  const fetchMedications = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('medications');
      if (cachedData) {
        setMedications(JSON.parse(cachedData));
      }

      const response = await retryFetch(() =>
        fetch(`${API_URL}/api/medications`, {
          credentials: 'include',
        })
      );

      const data = await response.json();
      setMedications(data);
      await AsyncStorage.setItem('medications', JSON.stringify(data));
    } catch (error) {
      if (!medications.length) {
        Alert.alert('Error', 'Failed to fetch medications. Please check your connection.');
      }
    }
  };

  const fetchInventory = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('inventory');
      if (cachedData) {
        setInventory(JSON.parse(cachedData));
      }

      const response = await retryFetch(() =>
        fetch(`${API_URL}/api/inventory`, {
          credentials: 'include',
        })
      );

      const data = await response.json();
      setInventory(data);
      await AsyncStorage.setItem('inventory', JSON.stringify(data));
    } catch (error) {
      if (!inventory.length) {
        Alert.alert('Error', 'Failed to fetch inventory. Please check your connection.');
      }
    }
  };

  const updateInventory = async () => {
    if (!selectedMedication || !quantity) {
      Alert.alert('Error', 'Please select a medication and enter quantity');
      return;
    }

    setIsLoading(true);
    try {
      const response = await retryFetch(() =>
        fetch(`${API_URL}/api/inventory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pharmacyId: user?.id,
            medicationId: selectedMedication.id,
            quantity: parseInt(quantity),
          }),
          credentials: 'include',
        })
      );

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      Alert.alert('Success', 'Inventory updated successfully');
      setSelectedMedication(null);
      setQuantity('');
      fetchInventory();
    } catch (error) {
      Alert.alert('Error', 'Failed to update inventory. Changes will be synced when connection is restored.');

      const pendingUpdates = await AsyncStorage.getItem('pendingInventoryUpdates');
      const updates = pendingUpdates ? JSON.parse(pendingUpdates) : [];
      updates.push({
        pharmacyId: user?.id,
        medicationId: selectedMedication.id,
        quantity: parseInt(quantity),
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem('pendingInventoryUpdates', JSON.stringify(updates));
    } finally {
      setIsLoading(false);
    }
  };

  if (!medications.length && isLoading) {
    return <LoadingScreen message="Loading inventory data..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.updateSection}>
        <Text style={styles.title}>Update Inventory</Text>

        <TouchableOpacity
          style={styles.select}
          onPress={() => {
            Alert.alert(
              'Select Medication',
              '',
              medications.map((med) => ({
                text: `${med.name} (Batch: ${med.batchId})`,
                onPress: () => setSelectedMedication(med),
              })).concat([
                { text: 'Cancel', style: 'cancel' },
              ] as any)
            );
          }}
        >
          <Text style={styles.selectText}>
            {selectedMedication ? selectedMedication.name : 'Select Medication'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Enter Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={updateInventory}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingIndicator size={24} />
          ) : (
            <Text style={styles.buttonText}>Update Inventory</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.subtitle}>Current Inventory</Text>
        <FlatList
          data={inventory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const medication = medications.find(m => m.id === item.medicationId);
            return (
              <View style={styles.inventoryItem}>
                <View>
                  <Text style={styles.medicationName}>
                    {medication?.name || 'Unknown'}
                  </Text>
                  <Text style={styles.medicationDetail}>
                    Batch: {medication?.batchId}
                  </Text>
                  <Text style={styles.medicationDetail}>
                    Manufacturer: {medication?.manufacturer}
                  </Text>
                </View>
                <View>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <Text style={styles.quantityLabel}>units</Text>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  updateSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  select: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listSection: {
    flex: 1,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  medicationDetail: {
    fontSize: 14,
    color: '#666',
  },
  quantity: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'right',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
});