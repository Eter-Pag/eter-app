import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

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

const STORAGE_KEY_EVENTOS = '@bts_eventos';
const STORAGE_KEY_CONFIG = '@bts_config_temas';

export default function ProximasFechasScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const t = Colors[colorScheme];
  
  const [eventos, setEventos] = useState<any>({});
  const [colorInterfaz, setColorInterfaz] = useState('#ffffff');
  const [colorCalendario, setColorCalendario] = useState('#9b59b6');

  const hoy = new Date();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const eventosGuardados = await AsyncStorage.getItem(STORAGE_KEY_EVENTOS);
        if (eventosGuardados) setEventos(JSON.parse(eventosGuardados));
        
        const configGuardada = await AsyncStorage.getItem(STORAGE_KEY_CONFIG);
        if (configGuardada) {
            const config = JSON.parse(configGuardada);
            if (config.interfaz) setColorInterfaz(config.interfaz);
            if (config.calendario) setColorCalendario(config.calendario);
        }
      } catch (e) { console.log('Error cargando datos:', e); }
    };
    cargarDatos();
    const interval = setInterval(cargarDatos, 2000);
    return () => clearInterval(interval);
  }, []);

  const todasLasFechas = useMemo(() => {
    const lista: any[] = [];
    const anioActual = hoy.getFullYear();

    // Añadir fechas de BTS
    FECHAS_BTS.forEach(f => {
      let fechaObj = new Date(anioActual, f.mes, f.dia);
      if (fechaObj < hoy && (fechaObj.getDate() !== hoy.getDate() || fechaObj.getMonth() !== hoy.getMonth())) {
        fechaObj = new Date(anioActual + 1, f.mes, f.dia);
      }
      lista.push({ ...f, date: fechaObj, esBTS: true });
    });

    // Añadir eventos personalizados
    Object.keys(eventos).forEach(clave => {
      const [a, m, d] = clave.split('-').map(Number);
      const fechaObj = new Date(a, m, d);
      if (fechaObj >= hoy || (fechaObj.getDate() === hoy.getDate() && fechaObj.getMonth() === hoy.getMonth())) {
        eventos[clave].forEach((texto: string) => {
          lista.push({ mes: m, dia: d, texto, date: fechaObj, esBTS: false });
        });
      }
    });

    return lista.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [eventos]);

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <LinearGradient colors={[colorCalendario + '22', '#0d0d1a']} style={StyleSheet.absoluteFill} />
      
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800)}>
          <Text style={[styles.title, { color: colorCalendario }]}>PRÓXIMAS</Text>
          <Text style={[styles.subtitle, { color: colorInterfaz + '99' }]}>Eventos y Fechas Especiales</Text>
        </Animated.View>

        <View style={styles.listContainer}>
          {todasLasFechas.length === 0 ? (
            <Text style={[styles.emptyText, { color: colorInterfaz + '66' }]}>No hay eventos próximos.</Text>
          ) : (
            todasLasFechas.map((item, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInDown.delay(index * 100).duration(800)}
                style={styles.itemWrapper}
              >
                <GlassCard style={styles.card} intensity={25}>
                  <View style={styles.cardRow}>
                    <View style={[styles.iconContainer, { backgroundColor: item.esBTS ? colorCalendario + '33' : colorInterfaz + '22' }]}>
                      <Text style={{fontSize: 22}}>{item.esBTS ? '💜' : '📅'}</Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={[styles.eventText, { color: colorInterfaz }]}>{item.texto}</Text>
                      <Text style={[styles.dateText, { color: colorInterfaz + '99' }]}>
                        {item.dia} de {MESES[item.mes]} {item.date.getFullYear() !== hoy.getFullYear() ? item.date.getFullYear() : ''}
                      </Text>
                    </View>
                    <View style={styles.daysBadge}>
                        <Text style={[styles.daysText, { color: item.esBTS ? colorCalendario : colorInterfaz }]}>
                            {Math.ceil((item.date.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))} d
                        </Text>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colorInterfaz + '4D' }]}>BTS CALENDAR • 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: 4 },
  subtitle: { fontSize: 14, fontWeight: '600', marginBottom: 30, letterSpacing: 1 },
  listContainer: { gap: 15 },
  itemWrapper: { width: '100%' },
  card: { borderRadius: 20, padding: 15 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconContainer: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  textContainer: { flex: 1 },
  eventText: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  dateText: { fontSize: 13, fontWeight: '600' },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  daysText: { fontSize: 12, fontWeight: '900' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: 50, paddingBottom: 20 },
  footerText: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
});
