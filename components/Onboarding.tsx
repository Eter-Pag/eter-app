import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Alert, ScrollView, Dimensions } from 'react-native';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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
        <View style={styles.inputWrapper}>
          <Text style={styles.miniLabel}>DÍA</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="01"
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={d}
            onChangeText={setD}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.miniLabel}>MES</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="01"
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={m}
            onChangeText={setM}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <View style={[styles.inputWrapper, { flex: 1.5 }]}>
          <Text style={styles.miniLabel}>AÑO</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="2026"
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={a}
            onChangeText={setA}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card} intensity={70}>
          <Text style={styles.title}>¡BIENVENIDA ARMY!</Text>
          <Text style={styles.subtitle}>Personaliza tu experiencia</Text>

          <TouchableOpacity style={styles.fotoContainer} onPress={seleccionarFoto}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.foto} />
            ) : (
              <View style={styles.fotoPlaceholder}>
                <Ionicons name="camera-outline" size={32} color="rgba(255,255,255,0.5)" />
                <Text style={styles.fotoText}>FOTO</Text>
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
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 2000,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    padding: 20,
    alignItems: 'center',
    borderRadius: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    marginBottom: 20,
  },
  fotoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  fotoPlaceholder: {
    alignItems: 'center',
  },
  fotoText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    marginTop: 4,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  inputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
    marginBottom: 4,
  },
  dateInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    height: 50,
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
    fontSize: 14,
  },
});
