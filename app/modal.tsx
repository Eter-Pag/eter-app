import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ProfileModal() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [eventos, setEventos] = useState<any>({});
  const [stats, setStats] = useState({ diasArmy: 0, diasCumple: 0 });

  useEffect(() => {
    const cargarDatos = async () => {
      const perfilGuardado = await AsyncStorage.getItem('@user_profile');
      const eventosGuardados = await AsyncStorage.getItem('@bts_eventos');
      
      if (perfilGuardado) {
        const p = JSON.parse(perfilGuardado);
        setPerfil(p);
        calcularStats(p);
      }
      if (eventosGuardados) setEventos(JSON.parse(eventosGuardados));
    };
    cargarDatos();
  }, []);

  const calcularStats = (p: any) => {
    const hoy = new Date();
    
    // Calcular días como ARMY
    const [dA, mA, aA] = p.armyDesde.split('/').map(Number);
    const fechaArmy = new Date(aA, mA - 1, dA);
    const diffArmy = Math.floor((hoy.getTime() - fechaArmy.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calcular días para el próximo cumpleaños
    const [dC, mC, aC] = p.nacimiento.split('/').map(Number);
    let proximoCumple = new Date(hoy.getFullYear(), mC - 1, dC);
    if (proximoCumple < hoy) proximoCumple.setFullYear(hoy.getFullYear() + 1);
    const diffCumple = Math.ceil((proximoCumple.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    setStats({ diasArmy: diffArmy, diasCumple: diffCumple });
  };

  const getEventosUsuario = () => {
    const lista: any[] = [];
    Object.keys(eventos).forEach(fecha => {
      eventos[fecha].forEach((texto: string) => {
        lista.push({ fecha, texto });
      });
    });
    return lista.slice(-5).reverse(); // Últimos 5 eventos
  };

  if (!perfil) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#0d0d1a']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-down" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MI PERFIL ARMY</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.fotoContainer}>
            {perfil.foto ? (
              <Image source={{ uri: perfil.foto }} style={styles.foto} />
            ) : (
              <Ionicons name="person-circle" size={120} color="rgba(255,255,255,0.2)" />
            )}
          </View>
          <Text style={styles.armyStatus}>ARMY DESDE EL {perfil.armyDesde}</Text>
        </View>

        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.diasArmy}</Text>
            <Text style={styles.statLabel}>DÍAS SIENDO ARMY</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.diasCumple}</Text>
            <Text style={styles.statLabel}>DÍAS PARA TU CUMPLE</Text>
          </GlassCard>
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>MIS EVENTOS RECIENTES</Text>
          {getEventosUsuario().length > 0 ? (
            getEventosUsuario().map((ev, i) => (
              <GlassCard key={i} style={styles.eventCard}>
                <View style={styles.eventIcon}>
                  <Ionicons name="calendar" size={20} color="#9b59b6" />
                </View>
                <View>
                  <Text style={styles.eventText}>{ev.texto}</Text>
                  <Text style={styles.eventDate}>{ev.fecha}</Text>
                </View>
              </GlassCard>
            ))
          ) : (
            <Text style={styles.noEvents}>No tienes eventos guardados aún.</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.resetBtn} 
          onPress={async () => {
            await AsyncStorage.removeItem('@user_profile');
            router.replace('/');
          }}
        >
          <Text style={styles.resetBtnText}>RESETEAR PERFIL</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginLeft: 15, letterSpacing: 2 },
  profileSection: { alignItems: 'center', marginBottom: 30 },
  fotoContainer: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 3, borderColor: '#9b59b6', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  foto: { width: '100%', height: '100%' },
  armyStatus: { color: '#9b59b6', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statCard: { flex: 1, padding: 20, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 5 },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '800', textAlign: 'center' },
  eventsSection: { width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 15, letterSpacing: 1 },
  eventCard: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10 },
  eventIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(155, 89, 182, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  eventText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  eventDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  noEvents: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  resetBtn: { marginTop: 40, alignSelf: 'center', padding: 10 },
  resetBtnText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 1 }
});
