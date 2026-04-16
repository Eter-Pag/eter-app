import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const IMAGENES = [
  require('../../assets/images/enero.jpg'),
  require('../../assets/images/febrero.jpg'),
  require('../../assets/images/marzo.jpg'),
  require('../../assets/images/abril.jpg'),
  require('../../assets/images/mayo.jpg'),
  require('../../assets/images/junio.jpg'),
  require('../../assets/images/julio.jpg'),
  require('../../assets/images/agosto.jpg'),
  require('../../assets/images/septiembre.jpg'),
  require('../../assets/images/octubre.jpg'),
  require('../../assets/images/noviembre.jpg'),
  require('../../assets/images/diciembre.jpg'),
];

const FECHAS_BTS = [
  { mes: 0, dia: 9,  texto: '💜 Jungkook Day' },
  { mes: 1, dia: 18, texto: '🎂 Cumpleaños J-Hope' },
  { mes: 2, dia: 9,  texto: '🎂 Cumpleaños Suga' },
  { mes: 4, dia: 5,  texto: '🏆 I Need U - Primer Premio (2015)' },
  { mes: 5, dia: 13, texto: '🎉 Debut oficial de BTS' },
  { mes: 6, dia: 4,  texto: '✈️ Jungkook llega a Seúl como trainee' },
  { mes: 6, dia: 9,  texto: '💜 Fundación del ARMY' },
  { mes: 7, dia: 31, texto: '🎂 Cumpleaños Jungkook' },
  { mes: 8, dia: 1,  texto: '🎂 Cumpleaños Jungkook (oficial)' },
  { mes: 8, dia: 12, texto: '🎂 Cumpleaños RM' },
  { mes: 8, dia: 24, texto: '🌍 BTS en la ONU (2018)' },
  { mes: 9, dia: 13, texto: '🎂 Cumpleaños Jimin' },
  { mes: 10, dia: 13,texto: '💜 Purple Day BTS + ARMY' },
  { mes: 11, dia: 4, texto: '🎂 Cumpleaños Jin' },
  { mes: 11, dia: 30,texto: '🎂 Cumpleaños V' },
];

const STORAGE_KEY = '@bts_eventos';

export default function Calendario() {
  const colorScheme = useColorScheme() ?? 'dark';
  const t = Colors[colorScheme];
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [eventos, setEventos] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const eventosGuardados = await AsyncStorage.getItem(STORAGE_KEY);
        if (eventosGuardados) setEventos(JSON.parse(eventosGuardados));
      } catch (e) { console.log('Error cargando datos:', e); }
    };
    cargarDatos();
  }, []);

  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDia = new Date(anio, mes, 1).getDay();

  const mesAnterior = () => { if (mes === 0) { setMes(11); setAnio(anio-1); } else setMes(mes-1); };
  const mesSiguiente = () => { if (mes === 11) { setMes(0); setAnio(anio+1); } else setMes(mes+1); };

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const fechaBTS = (d: number) => FECHAS_BTS.find(f => f.mes === mes && f.dia === d);
  
  return (
    <View style={[s.container, { backgroundColor: t.background }]}>
      <Image source={IMAGENES[mes]} style={s.bgImage} blurRadius={Platform.OS === 'ios' ? 0 : 2} />
      <LinearGradient colors={['rgba(0,0,0,0.3)', t.background]} style={s.overlay} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <Animated.View entering={FadeInDown.duration(800)} style={s.header}>
          <View>
            <Text style={s.titleText}>BTS CALENDAR</Text>
            <Text style={s.koreanText}>방탄소년단 • 2026 Edition</Text>
          </View>
          <TouchableOpacity style={s.profileBtn}>
             <Ionicons name="person-circle-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <WeatherWidget />

        <Animated.View entering={FadeInDown.delay(200).duration(800)}>
          <GlassCard style={s.calendarCard}>
            <View style={s.navRow}>
              <TouchableOpacity onPress={mesAnterior} style={s.navBtn}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={s.mesTitulo}>{MESES[mes].toUpperCase()} {anio}</Text>
              <TouchableOpacity onPress={mesSiguiente} style={s.navBtn}>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={s.diasSemanaRow}>
              {DIAS.map(d => <Text key={d} style={s.diaSemanaText}>{d}</Text>)}
            </View>

            <View style={s.grid}>
              {celdas.map((dia, i) => {
                const esBTS = dia && !!fechaBTS(dia);
                const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
                
                return (
                  <TouchableOpacity 
                    key={i} 
                    disabled={!dia}
                    style={[
                      s.celda, 
                      esHoy && s.celdaHoy,
                      esBTS && s.celdaBTS
                    ]} 
                  >
                    <Text style={[s.diaNum, { color: dia ? '#fff' : 'transparent' }, esHoy && { fontWeight: 'bold' }]}>
                      {dia || ''}
                    </Text>
                    {esBTS && <View style={s.btsIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={s.eventsSection}>
           <Text style={s.sectionTitle}>Eventos Especiales</Text>
           {FECHAS_BTS.filter(f => f.mes === mes).map((f, i) => (
             <GlassCard key={i} style={s.eventItem}>
                <View style={s.eventContent}>
                  <View style={s.eventIcon}>
                    <Text style={{fontSize: 20}}>💜</Text>
                  </View>
                  <View>
                    <Text style={s.eventText}>{f.texto}</Text>
                    <Text style={s.eventDate}>{f.dia} de {MESES[mes]}</Text>
                  </View>
                </View>
             </GlassCard>
           ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  bgImage: { position: 'absolute', width: width, height: height, resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  titleText: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  koreanText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  profileBtn: { padding: 4 },

  calendarCard: { marginBottom: 25, paddingVertical: 10 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  navBtn: { padding: 5 },
  mesTitulo: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  diasSemanaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  diaSemanaText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)', width: (width - 100) / 7, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  celda: { width: (width - 100) / 7, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  celdaHoy: { backgroundColor: 'rgba(155, 89, 182, 0.6)', borderWidth: 1, borderColor: '#fff' },
  celdaBTS: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  diaNum: { fontSize: 15 },
  btsIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#d7bde2', marginTop: 2 },

  eventsSection: { marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 15, marginLeft: 5 },
  eventItem: { marginBottom: 12 },
  eventContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  eventIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  eventText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  eventDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
});
