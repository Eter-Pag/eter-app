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
        // Usando Open-Meteo (Gratis, sin API Key)
        // Coordenadas por defecto (Ciudad de México) - Se podría usar geolocalización en el futuro
        const lat = 19.4326;
        const lon = -99.1332;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const code = data.current_weather.weathercode;
        let condition = "Despejado";
        let icon: any = "sunny-outline";

        // Mapeo simple de códigos de clima
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
      <GlassCard style={styles.loadingContainer}>
        <ActivityIndicator color="#fff" />
      </GlassCard>
    );
  }

  if (!weather) return null;

  return (
    <Animated.View entering={FadeIn.duration(1000)}>
      <GlassCard style={styles.container}>
        <View style={styles.content}>
          <View style={styles.leftInfo}>
            <Text style={styles.location}>{weather.location}</Text>
            <Text style={styles.temp}>{weather.temp}°C</Text>
            <Text style={styles.condition}>{weather.condition}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name={weather.icon} size={48} color="#fff" />
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    marginBottom: 20,
  },
  container: {
    marginBottom: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  leftInfo: {
    flex: 1,
  },
  location: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  temp: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    marginVertical: 2,
  },
  condition: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
