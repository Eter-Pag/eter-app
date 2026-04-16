import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

interface WeatherData {
  temp: number;
  condition: string;
  icon: any;
  location: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const lat = 19.4326;
        const lon = -99.1332;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const code = data.current_weather.weathercode;
        let condition = "Despejado";
        let icon: any = "sunny-outline";

        if (code >= 1 && code <= 3) { condition = "Parcialmente Nublado"; icon = "partly-sunny-outline"; }
        else if (code >= 45 && code <= 48) { condition = "Niebla"; icon = "cloudy-outline"; }
        else if (code >= 51 && code <= 67) { condition = "Lluvia"; icon = "rainy-outline"; }
        else if (code >= 71 && code <= 77) { condition = "Nieve"; icon = "snow-outline"; }
        else if (code >= 80 && code <= 82) { condition = "Chubascos"; icon = "thunderstorm-outline"; }

        setWeather({
          temp: Math.round(data.current_weather.temperature),
          condition: condition,
          icon: icon,
          location: "CDMX, MX"
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="rgba(255,255,255,0.5)" />
      </View>
    );
  }

  if (!weather) return null;

  return (
    <Animated.View entering={FadeIn.duration(1000)}>
      <GlassCard style={styles.container} intensity={10}>
        <View style={styles.content}>
          <View style={styles.leftInfo}>
            <Text style={styles.location}>{weather.location}</Text>
            <Text style={styles.temp}>{weather.temp}°C</Text>
            <Text style={styles.condition}>{weather.condition}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name={weather.icon} size={42} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 80,
    justifyContent: 'center',
    marginBottom: 20,
  },
  container: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.02)', // Casi invisible
    borderColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  leftInfo: {
    flex: 1,
  },
  location: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  temp: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 0,
  },
  condition: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
