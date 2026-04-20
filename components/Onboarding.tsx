import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Alert } from 'react-native';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [foto, setFoto] = useState<string | null>(null);
  const [nacimiento, setNacimiento] = useState('');
  const [armyDesde, setArmyDesde] = useState('');

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para la foto de perfil.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const finalizar = async () => {
    if (!nacimiento || !armyDesde) {
      Alert.alert('Campos incompletos', 'Por favor ingresa las fechas solicitadas.');
      return;
    }

    // Validar formato simple DD/MM/AAAA
    const regexFecha = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexFecha.test(nacimiento) || !regexFecha.test(armyDesde)) {
      Alert.alert('Formato incorrecto', 'Usa el formato DD/MM/AAAA para las fechas.');
      return;
    }

    const perfilData = {
      foto,
      nacimiento,
      armyDesde,
      completado: true
    };

    try {
      await AsyncStorage.setItem('@user_profile', JSON.stringify(perfilData));
      onComplete(perfilData);
    } catch (e) {
      console.error('Error guardando perfil:', e);
    }
  };

  return (
    <View style={styles.overlay}>
      <GlassCard style={styles.card} intensity={60}>
        <Text style={styles.title}>¡BIENVENIDA ARMY!</Text>
        <Text style={styles.subtitle}>Personaliza tu experiencia</Text>

        <TouchableOpacity style={styles.fotoContainer} onPress={seleccionarFoto}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.foto} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Ionicons name="camera-outline" size={40} color="rgba(255,255,255,0.5)" />
              <Text style={styles.fotoText}>FOTO DE PERFIL</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TU CUMPLEAÑOS (DD/MM/AAAA)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 01/09/1997"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={nacimiento}
            onChangeText={setNacimiento}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>¿DESDE CUÁNDO ERES ARMY? (DD/MM/AAAA)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 13/06/2013"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={armyDesde}
            onChangeText={setArmyDesde}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={finalizar}>
          <Text style={styles.btnText}>COMENZAR</Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    marginBottom: 30,
  },
  fotoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  fotoPlaceholder: {
    alignItems: 'center',
  },
  fotoText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '800',
    marginTop: 5,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btn: {
    width: '100%',
    height: 55,
    backgroundColor: '#9b59b6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
