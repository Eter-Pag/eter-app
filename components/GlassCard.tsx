import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
}

export function GlassCard({ children, style, intensity = 30, noPadding = false }: GlassCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const t = Colors[colorScheme];

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, noPadding && { padding: 0 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Un fondo mínimo para dar consistencia
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Un solo borde muy fino
  },
  content: {
    padding: 16,
    width: '100%',
  },
});
