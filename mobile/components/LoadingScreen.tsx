import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoadingIndicator } from './LoadingIndicator';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...'
}) => {
  return (
    <View style={styles.container}>
      <LoadingIndicator size={120} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '500',
    textAlign: 'center',
  },
});
