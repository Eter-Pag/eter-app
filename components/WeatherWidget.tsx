import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
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
    async function fetchWeather(lat: number, lon: number, locationName: string = "Tu Ubicación") {
      try {
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
          location: locationName
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    // Intentar obtener geolocalización (solo funciona si el usuario da permiso)
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude, "Tu Ciudad");
        },
        () => {
          // Fallback a CDMX si no hay permiso
          fetchWeather(19.4326, -99.1332, "CDMX, MX");
        }
      );
    } else {
      // Fallback a CDMX para otros entornos o si no está disponible
      fetchWeather(19.4326, -99.1332, "CDMX, MX");
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="rgba(255,255,255,0.8)" size="small" />
      </View>
    );
  }

  if (!weather) return null;

  return (
    <Animated.View entering={FadeIn.duration(1000)}>
      {/* Contenedor con opacidad al 1% (casi nulo) */}
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.leftInfo}>
            <Text style={styles.location}>{weather.location}</Text>
            <Text style={styles.temp}>{weather.temp}°C</Text>
            <Text style={styles.condition}>{weather.condition}</Text>
          </View>
          <View style={styles.iconContainer}>
            {/* Icono al 100% de opacidad */}
            <Ionicons name={weather.icon} size={42} color="rgba(255,255,255,1)" />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 60,
    justifyContent: 'center',
    marginBottom: 15,
  },
  container: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.01)', // 1% de fondo (casi invisible)
    borderColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flex: 1,
  },
  location: {
    color: 'rgba(255,255,255,0.6)', // Muy visible
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  temp: {
    color: 'rgba(255,255,255,1)', // 100% Visible
    fontSize: 36,
    fontWeight: '900',
    marginVertical: -2,
  },
  condition: {
    color: 'rgba(255,255,255,0.9)', // Muy visible
    fontSize: 13,
    fontWeight: '700',
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
