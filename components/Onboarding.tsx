import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Alert, ScrollView } from 'react-native';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [foto, setFoto] = useState<string | null>(null);
  
  // Estados para Nacimiento
  const [diaN, setDiaN] = useState('');
  const [mesN, setMesN] = useState('');
  const [anioN, setAnioN] = useState('');

  // Estados para Aniversario ARMY
  const [diaA, setDiaA] = useState('');
  const [mesA, setMesA] = useState('');
  const [anioA, setAnioA] = useState('');

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

  const validarYFinalizar = async () => {
    if (!diaN || !mesN || !anioN || !diaA || !mesA || !anioA) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos de fecha.');
      return;
    }

    // Formatear fechas a DD/MM/AAAA asegurando ceros a la izquierda
    const pad = (n: string) => n.length === 1 ? '0' + n : n;
    const nacimiento = `${pad(diaN)}/${pad(mesN)}/${anioN}`;
    const armyDesde = `${pad(diaA)}/${pad(mesA)}/${anioA}`;

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

  const DateInputGroup = ({ label, d, setD, m, setM, a, setA }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={[styles.input, styles.dateInput]}
          placeholder="DD"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={d}
          onChangeText={setD}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.dateInput]}
          placeholder="MM"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={m}
          onChangeText={setM}
          keyboardType="numeric"
          maxLength={2}
        />
        <TextInput
          style={[styles.input, styles.yearInput]}
          placeholder="AAAA"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={a}
          onChangeText={setA}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

          <DateInputGroup 
            label="TU CUMPLEAÑOS" 
            d={diaN} setD={setDiaN} 
            m={mesN} setM={setMesN} 
            a={anioN} setA={setAnioN} 
          />

          <DateInputGroup 
            label="¿DESDE CUÁNDO ERES ARMY?" 
            d={diaA} setD={setDiaA} 
            m={mesA} setM={setMesA} 
            a={anioA} setA={setAnioA} 
          />

          <TouchableOpacity style={styles.btn} onPress={validarYFinalizar}>
            <Text style={styles.btnText}>COMENZAR</Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 2000,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    marginBottom: 25,
  },
  fotoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  fotoPlaceholder: {
    alignItems: 'center',
  },
  fotoText: {
    fontSize: 9,
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
    marginBottom: 10,
    marginLeft: 5,
    letterSpacing: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  dateInput: {
    flex: 1,
  },
  yearInput: {
    flex: 1.5,
  },
  btn: {
    width: '100%',
    height: 55,
    backgroundColor: '#9b59b6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#9b59b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
