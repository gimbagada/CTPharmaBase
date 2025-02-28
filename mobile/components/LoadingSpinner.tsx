import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 100,
  color = '#2563eb'
}) => {
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
      <View style={styles.background} />
      <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
        <MaterialCommunityIcons 
          name="pill" 
          size={size} 
          color={color}
          style={styles.pill}
        />
      </Animated.View>
      <View style={styles.crossContainer}>
        <MaterialCommunityIcons 
          name="plus" 
          size={size * 0.5} 
          color={color}
          style={styles.cross}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 999,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
  },
  spinner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  crossContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cross: {
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  }
});