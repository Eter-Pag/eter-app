import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
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
const STORAGE_TEMA = '@bts_tema';

const TEMAS_PERSONALIZADOS = {
  morado: { accent: '#9b59b6', bg: 'rgba(155, 89, 182, 0.3)' },
  rosa: { accent: '#ec407a', bg: 'rgba(236, 64, 122, 0.3)' },
  azul: { accent: '#3b82f6', bg: 'rgba(59, 130, 246, 0.3)' },
};

export default function Calendario() {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const [temaManual, setTemaManual] = useState<string | null>(null);
  const colorScheme = (temaManual === 'oscuro' ? 'dark' : (temaManual === 'claro' ? 'light' : systemColorScheme)) as 'light' | 'dark';
  const t = Colors[colorScheme];
  
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [eventos, setEventos] = useState<any>({});
  const [accentColor, setAccentColor] = useState('#9b59b6');
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [nuevoEventoTexto, setNuevoEventoTexto] = useState('');
  const [uiVisible, setUiVisible] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const eventosGuardados = await AsyncStorage.getItem(STORAGE_KEY);
        if (eventosGuardados) setEventos(JSON.parse(eventosGuardados));
        const temaGuardado = await AsyncStorage.getItem(STORAGE_TEMA);
        if (temaGuardado) {
            const parsed = JSON.parse(temaGuardado);
            setAccentColor(parsed.accent || '#9b59b6');
        }
      } catch (e) { console.log('Error cargando datos:', e); }
    };
    cargarDatos();
  }, []);

  const guardarEvento = async () => {
    if (!diaSeleccionado || !nuevoEventoTexto.trim()) return;
    const clave = `${anio}-${mes}-${diaSeleccionado}`;
    const nuevosEventos = { ...eventos, [clave]: [...(eventos[clave] || []), nuevoEventoTexto] };
    setEventos(nuevosEventos);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosEventos));
    setNuevoEventoTexto('');
    setModalEventoVisible(false);
  };

  const cambiarTema = async (color: string) => {
    setAccentColor(color);
    await AsyncStorage.setItem(STORAGE_TEMA, JSON.stringify({ accent: color }));
  };

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
      <Image source={IMAGENES[mes]} style={s.bgImage} />
      <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)', t.background]} style={s.overlay} />
      
      {/* Navegación flotante lateral (solo en modo imagen) */}
      {!uiVisible && (
        <>
          <TouchableOpacity style={[s.sideNavBtn, { left: 10 }]} onPress={mesAnterior}>
            <GlassCard style={s.sideNavCard} intensity={20}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </GlassCard>
          </TouchableOpacity>
          <TouchableOpacity style={[s.sideNavBtn, { right: 10 }]} onPress={mesSiguiente}>
            <GlassCard style={s.sideNavCard} intensity={20}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </GlassCard>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.restoreUiBtn} onPress={() => setUiVisible(true)}>
            <GlassCard style={s.restoreUiCard} intensity={40}>
                <Ionicons name="calendar-outline" size={16} color="#fff" />
                <Text style={s.restoreUiText}>VER CALENDARIO</Text>
            </GlassCard>
          </TouchableOpacity>
        </>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 5 }]}>
        {uiVisible && (
          <Animated.View entering={FadeIn.duration(600)} exiting={FadeOut.duration(400)}>
            <Animated.View entering={FadeInDown.duration(800)} style={s.header}>
              <View>
                <Text style={s.titleText}>BTS CALENDAR</Text>
                <Text style={s.koreanText}>방탄소년단 • 2026 Edition</Text>
              </View>
              <View style={s.headerBtns}>
                  <TouchableOpacity style={s.iconBtn} onPress={() => setMenuVisible(true)}>
                     <Ionicons name="settings-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.iconBtn}>
                     <Ionicons name="person-circle-outline" size={32} color="#fff" />
                  </TouchableOpacity>
              </View>
            </Animated.View>

            <WeatherWidget />

            <Animated.View entering={FadeInDown.delay(200).duration(800)}>
              <GlassCard style={s.calendarCard} intensity={20}>
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
                    const clave = `${anio}-${mes}-${dia}`;
                    const tieneEvento = dia && eventos[clave]?.length > 0;
                    
                    return (
                      <TouchableOpacity 
                        key={i} 
                        disabled={!dia}
                        onPress={() => {
                            if (dia) {
                                setDiaSeleccionado(dia);
                                setModalEventoVisible(true);
                            }
                        }}
                        style={[
                          s.celda, 
                          esHoy && { backgroundColor: accentColor + '99', borderColor: '#fff', borderWidth: 1 },
                          (esBTS || tieneEvento) && { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
                        ]} 
                      >
                        <Text style={[s.diaNum, { color: dia ? '#fff' : 'transparent' }, esHoy && { fontWeight: 'bold' }]}>
                          {dia || ''}
                        </Text>
                        {esBTS && <View style={[s.btsIndicator, { backgroundColor: accentColor }]} />}
                        {tieneEvento && <View style={s.eventIndicator} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </GlassCard>
              
              <TouchableOpacity style={s.hideUiBtn} onPress={() => setUiVisible(false)}>
                <View style={[s.hideUiInner, { backgroundColor: accentColor }]}>
                    <Ionicons name="image-outline" size={14} color="#fff" />
                    <Text style={s.hideUiText}>VER IMAGEN</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(800)} style={s.eventsSection}>
               <Text style={s.sectionTitle}>Eventos del Mes</Text>
               {FECHAS_BTS.filter(f => f.mes === mes).map((f, i) => (
                 <GlassCard key={`bts-${i}`} style={s.eventItem} intensity={15}>
                    <View style={s.eventContent}>
                      <View style={[s.eventIcon, { backgroundColor: accentColor + '33' }]}>
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
          </Animated.View>
        )}
      </ScrollView>

      {/* Modales de Ajustes y Eventos */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setMenuVisible(false)} />
            <Animated.View entering={FadeIn.duration(300)} style={s.modalContainer}>
                <GlassCard style={s.modalCard} intensity={50}>
                    <Text style={s.modalTitle}>AJUSTES</Text>
                    <Text style={s.modalSub}>Temas de Color</Text>
                    <View style={s.themeRow}>
                        {Object.entries(TEMAS_PERSONALIZADOS).map(([name, theme]) => (
                            <TouchableOpacity 
                                key={name} 
                                style={[s.themeCircle, { backgroundColor: theme.accent }]} 
                                onPress={() => cambiarTema(theme.accent)}
                            >
                                {accentColor === theme.accent && <Ionicons name="checkmark" size={20} color="#fff" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={s.closeBtn} onPress={() => setMenuVisible(false)}>
                        <Text style={s.closeBtnText}>CERRAR</Text>
                    </TouchableOpacity>
                </GlassCard>
            </Animated.View>
        </View>
      </Modal>

      <Modal visible={modalEventoVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setModalEventoVisible(false)} />
            <View style={s.modalBottomContainer}>
                <GlassCard style={s.modalCard} intensity={60}>
                    <Text style={s.modalTitle}>NUEVO EVENTO</Text>
                    <Text style={s.modalSub}>{diaSeleccionado} de {MESES[mes]}</Text>
                    <TextInput 
                        style={s.input}
                        placeholder="Nombre del evento..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={nuevoEventoTexto}
                        onChangeText={setNuevoEventoTexto}
                        autoFocus
                    />
                    <View style={s.modalBtnRow}>
                        <TouchableOpacity style={[s.actionBtn, { backgroundColor: accentColor }]} onPress={guardarEvento}>
                            <Text style={s.actionBtnText}>GUARDAR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.cancelBtn} onPress={() => setModalEventoVisible(false)}>
                            <Text style={s.cancelBtnText}>CANCELAR</Text>
                        </TouchableOpacity>
                    </View>
                </GlassCard>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  bgImage: { position: 'absolute', width: width, height: height, resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 5 },
  titleText: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  koreanText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

  sideNavBtn: { position: 'absolute', top: height / 2 - 25, zIndex: 110, width: 50, height: 50 },
  sideNavCard: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', padding: 0 },

  hideUiBtn: { alignSelf: 'center', marginTop: -10, marginBottom: 20 },
  hideUiInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  hideUiText: { color: '#fff', fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },

  restoreUiBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 100 },
  restoreUiCard: { paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 25, backgroundColor: 'rgba(155, 89, 182, 0.6)' },
  restoreUiText: { color: '#fff', fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },

  calendarCard: { marginBottom: 25, paddingVertical: 10 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  navBtn: { padding: 5 },
  mesTitulo: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  diasSemanaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  diaSemanaText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)', width: (width - 100) / 7, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  celda: { width: (width - 100) / 7, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  diaNum: { fontSize: 15 },
  btsIndicator: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  eventIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', marginTop: 2, position: 'absolute', bottom: 5 },

  eventsSection: { marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 15, marginLeft: 5 },
  eventItem: { marginBottom: 12 },
  eventContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  eventIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  eventText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  eventDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 400 },
  modalBottomContainer: { width: '100%', maxWidth: 400, position: 'absolute', bottom: 40 },
  modalCard: { padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 10, letterSpacing: 2 },
  modalSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '700', marginBottom: 20 },
  themeRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  themeCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  input: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, color: '#fff', fontSize: 16, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBtnRow: { flexDirection: 'row', gap: 15, width: '100%' },
  actionBtn: { flex: 1, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  closeBtn: { width: '100%', height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
});
