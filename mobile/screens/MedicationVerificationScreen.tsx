import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_URL } from '../config';

type RootStackParamList = {
  MedicationVerification: undefined;
  Dashboard: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'MedicationVerification'>;

export default function MedicationVerificationScreen({ navigation }: Props) {
  const [batchId, setBatchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);

  const verifyMedication = async () => {
    if (!batchId) {
      Alert.alert('Error', 'Please enter a batch ID');
      return;
    }

    setIsLoading(true);
    try {
      // Attempt to fetch medications
      const response = await fetch(`${API_URL}/api/medications`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }

      const data = await response.json();
      const medication = data.find((m: any) => m.batchId === batchId);

      if (medication) {
        // Verify the medication
        const verifyResponse = await fetch(`${API_URL}/api/medications/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: medication.id }),
          credentials: 'include',
        });

        if (!verifyResponse.ok) {
          throw new Error('Failed to verify medication');
        }

        Alert.alert('Success', 'Medication verified successfully');
        setMedications(data);
      } else {
        Alert.alert('Error', 'Medication not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify medication. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.verificationSection}>
        <Text style={styles.title}>Verify Medication</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Batch ID"
          value={batchId}
          onChangeText={setBatchId}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={verifyMedication}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.subtitle}>Recent Verifications</Text>
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.medicationItem}>
              <View>
                <Text style={styles.medicationName}>{item.name}</Text>
                <Text style={styles.medicationDetail}>Batch: {item.batchId}</Text>
                <Text style={styles.medicationDetail}>
                  Manufacturer: {item.manufacturer}
                </Text>
              </View>
              <View>
                <Text style={[
                  styles.status,
                  item.verifiedAt ? styles.verified : styles.unverified
                ]}>
                  {item.verifiedAt ? 'Verified' : 'Unverified'}
                </Text>
              </View>
            </View>
          )}
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
  verificationSection: {
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
  medicationItem: {
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
  status: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
    fontSize: 14,
    fontWeight: 'bold',
  },
  verified: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  unverified: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
});