import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { GlassCard } from '@/components/GlassCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const IMAGENES_DEFAULT = [
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

const STORAGE_KEY_EVENTOS = '@bts_eventos';
const STORAGE_KEY_CONFIG = '@bts_config_temas';
const STORAGE_KEY_FONDOS = '@bts_fondos_personalizados';

const COLORES_PALETA = [
  '#9b59b6', '#ec407a', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ffffff', '#fbbf24', '#a855f7',
];

export default function Calendario() {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const t = Colors[systemColorScheme];
  
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [eventos, setEventos] = useState<any>({});
  
  // Estados de Personalización
  const [colorCalendario, setColorCalendario] = useState('#9b59b6');
  const [colorInterfaz, setColorInterfaz] = useState('#ffffff');
  const [colorExplore, setColorExplore] = useState('#3b82f6');
  const [fondosPersonalizados, setFondosPersonalizados] = useState<any>({});
  
  // Modales y Estados de UI
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [nuevoEventoTexto, setNuevoEventoTexto] = useState('');
  const [uiVisible, setUiVisible] = useState(true);
  const [seccionAjustes, setSeccionAjustes] = useState<'cal' | 'int' | 'exp' | 'bg'>('cal');
  const [mesAjusteFondo, setMesAjusteFondo] = useState(hoy.getMonth());

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const eventosGuardados = await AsyncStorage.getItem(STORAGE_KEY_EVENTOS);
        if (eventosGuardados) setEventos(JSON.parse(eventosGuardados));
        
        const configGuardada = await AsyncStorage.getItem(STORAGE_KEY_CONFIG);
        if (configGuardada) {
            const config = JSON.parse(configGuardada);
            if (config.calendario) setColorCalendario(config.calendario);
            if (config.interfaz) setColorInterfaz(config.interfaz);
            if (config.explore) setColorExplore(config.explore);
        }

        const fondosGuardados = await AsyncStorage.getItem(STORAGE_KEY_FONDOS);
        if (fondosGuardados) setFondosPersonalizados(JSON.parse(fondosGuardados));
      } catch (e) { console.log('Error cargando datos:', e); }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (menuVisible) {
      setMesAjusteFondo(mes);
    }
  }, [menuVisible, mes]);

  const guardarConfig = async (nuevaConfig: any) => {
    try {
        const configActual = await AsyncStorage.getItem(STORAGE_KEY_CONFIG);
        const configObj = configActual ? JSON.parse(configActual) : {};
        const configFinal = { ...configObj, ...nuevaConfig };
        await AsyncStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configFinal));
    } catch (e) { console.log('Error guardando config:', e); }
  };

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      if (Platform.OS !== 'web') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para cambiar el fondo.');
      }
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const nuevosFondos = { ...fondosPersonalizados, [mesAjusteFondo]: uri };
      setFondosPersonalizados(nuevosFondos);
      await AsyncStorage.setItem(STORAGE_KEY_FONDOS, JSON.stringify(nuevosFondos));
    }
  };

  const restaurarImagenOriginal = async () => {
    const nuevosFondos = { ...fondosPersonalizados };
    delete nuevosFondos[mesAjusteFondo];
    setFondosPersonalizados(nuevosFondos);
    await AsyncStorage.setItem(STORAGE_KEY_FONDOS, JSON.stringify(nuevosFondos));
  };

  const guardarEvento = async () => {
    if (!diaSeleccionado || !nuevoEventoTexto.trim()) return;
    const clave = `${anio}-${mes}-${diaSeleccionado}`;
    const nuevosEventos = { ...eventos, [clave]: [...(eventos[clave] || []), nuevoEventoTexto] };
    setEventos(nuevosEventos);
    await AsyncStorage.setItem(STORAGE_KEY_EVENTOS, JSON.stringify(nuevosEventos));
    setNuevoEventoTexto('');
    setModalEventoVisible(false);
  };

  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDia = new Date(anio, mes, 1).getDay();

  const mesAnterior = () => { if (mes === 0) { setMes(11); setAnio(anio-1); } else setMes(mes-1); };
  const mesSiguiente = () => { if (mes === 11) { setMes(0); setAnio(anio+1); } else setMes(mes+1); };

  const mesAjusteAnterior = () => { if (mesAjusteFondo === 0) setMesAjusteFondo(11); else setMesAjusteFondo(mesAjusteFondo - 1); };
  const mesAjusteSiguiente = () => { if (mesAjusteFondo === 11) setMesAjusteFondo(0); else setMesAjusteFondo(mesAjusteFondo + 1); };

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const fechaBTS = (d: number) => FECHAS_BTS.find(f => f.mes === mes && f.dia === d);
  
  const imagenFondoActual = fondosPersonalizados[mes] ? { uri: fondosPersonalizados[mes] } : IMAGENES_DEFAULT[mes];
  const imagenPreviewAjuste = fondosPersonalizados[mesAjusteFondo] ? { uri: fondosPersonalizados[mesAjusteFondo] } : IMAGENES_DEFAULT[mesAjusteFondo];
  
  return (
    <View style={[s.container, { backgroundColor: t.background }]}>
      <Image source={imagenFondoActual} style={s.bgImage} />
      <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)', t.background]} style={s.overlay} />
      
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
            <GlassCard style={[s.restoreUiCard, { backgroundColor: colorInterfaz + '60' }]} intensity={40}>
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
                <Text style={[s.titleText, { color: colorInterfaz }]}>BTS CALENDAR</Text>
                <Text style={[s.koreanText, { color: colorInterfaz + 'CC' }]}>방탄소년단 • 2026 Edition</Text>
              </View>
              <View style={s.headerBtns}>
                  <TouchableOpacity style={s.iconBtn} onPress={() => setMenuVisible(true)}>
                     <Ionicons name="settings-outline" size={24} color={colorInterfaz} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.iconBtn}>
                     <Ionicons name="person-circle-outline" size={32} color={colorInterfaz} />
                  </TouchableOpacity>
              </View>
            </Animated.View>

            <WeatherWidget />

            <Animated.View entering={FadeInDown.delay(200).duration(800)} style={{ marginTop: 35 }}>
              <GlassCard style={s.calendarCard} intensity={20}>
                <View style={s.navRow}>
                  <TouchableOpacity onPress={mesAnterior} style={s.navBtn}>
                    <Ionicons name="chevron-back" size={24} color={colorCalendario} />
                  </TouchableOpacity>
                  <Text style={[s.mesTitulo, { color: colorCalendario }]}>{MESES[mes].toUpperCase()} {anio}</Text>
                  <TouchableOpacity onPress={mesSiguiente} style={s.navBtn}>
                    <Ionicons name="chevron-forward" size={24} color={colorCalendario} />
                  </TouchableOpacity>
                </View>

                <View style={s.diasSemanaRow}>
                  {DIAS.map(d => <Text key={d} style={[s.diaSemanaText, { color: colorCalendario + '99' }]}>{d}</Text>)}
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
                        onPress={() => { if (dia) { setDiaSeleccionado(dia); setModalEventoVisible(true); } }}
                        style={[
                          s.celda, 
                          esHoy && { backgroundColor: colorCalendario + '99', borderColor: '#fff', borderWidth: 1 },
                          (esBTS || tieneEvento) && { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
                        ]} 
                      >
                        <Text style={[s.diaNum, { color: dia ? (esHoy ? '#fff' : (esBTS ? colorCalendario : '#fff')) : 'transparent' }, esHoy && { fontWeight: 'bold' }]}>
                          {dia || ''}
                        </Text>
                        {esBTS && <View style={[s.btsIndicator, { backgroundColor: colorCalendario }]} />}
                        {tieneEvento && <View style={s.eventIndicator} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </GlassCard>
              
              <TouchableOpacity style={s.hideUiBtn} onPress={() => setUiVisible(false)}>
                <View style={[s.hideUiInner, { backgroundColor: colorInterfaz }]}>
                    <Ionicons name="image-outline" size={14} color={t.background} />
                    <Text style={[s.hideUiText, { color: t.background }]}>VER IMAGEN</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(800)} style={s.eventsSection}>
               <Text style={[s.sectionTitle, { color: colorInterfaz }]}>Eventos del Mes</Text>
               {FECHAS_BTS.filter(f => f.mes === mes).map((f, i) => (
                 <GlassCard key={`bts-${i}`} style={s.eventItem} intensity={15}>
                    <View style={s.eventContent}>
                      <View style={[s.eventIcon, { backgroundColor: colorCalendario + '33' }]}>
                        <Text style={{fontSize: 20}}>💜</Text>
                      </View>
                      <View>
                        <Text style={[s.eventText, { color: colorInterfaz }]}>{f.texto}</Text>
                        <Text style={[s.eventDate, { color: colorInterfaz + '99' }]}>{f.dia} de {MESES[mes]}</Text>
                      </View>
                    </View>
                 </GlassCard>
               ))}
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Modal de Ajustes Avanzado */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setMenuVisible(false)} />
            <Animated.View entering={FadeIn.duration(300)} style={s.modalContainer}>
                <GlassCard style={s.modalCard} intensity={60}>
                    <Text style={s.modalTitle}>PERSONALIZAR</Text>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll}>
                        <TouchableOpacity onPress={() => setSeccionAjustes('cal')} style={[s.tab, seccionAjustes === 'cal' && { borderBottomColor: colorCalendario, borderBottomWidth: 2 }]}>
                            <Text style={[s.tabText, seccionAjustes === 'cal' && { color: colorCalendario }]}>CALENDARIO</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSeccionAjustes('int')} style={[s.tab, seccionAjustes === 'int' && { borderBottomColor: colorInterfaz, borderBottomWidth: 2 }]}>
                            <Text style={[s.tabText, seccionAjustes === 'int' && { color: colorInterfaz }]}>INTERFAZ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSeccionAjustes('exp')} style={[s.tab, seccionAjustes === 'exp' && { borderBottomColor: colorExplore, borderBottomWidth: 2 }]}>
                            <Text style={[s.tabText, seccionAjustes === 'exp' && { color: colorExplore }]}>EXPLORE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSeccionAjustes('bg')} style={[s.tab, seccionAjustes === 'bg' && { borderBottomColor: '#fff', borderBottomWidth: 2 }]}>
                            <Text style={[s.tabText, seccionAjustes === 'bg' && { color: '#fff' }]}>FONDOS</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {(seccionAjustes === 'cal' || seccionAjustes === 'int' || seccionAjustes === 'exp') && (
                        <View style={s.colorGrid}>
                            {COLORES_PALETA.map((color, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    style={[s.colorCircle, { backgroundColor: color }]} 
                                    onPress={() => {
                                        if (seccionAjustes === 'cal') { setColorCalendario(color); guardarConfig({calendario: color}); }
                                        if (seccionAjustes === 'int') { setColorInterfaz(color); guardarConfig({interfaz: color}); }
                                        if (seccionAjustes === 'exp') { setColorExplore(color); guardarConfig({explore: color}); }
                                    }}
                                >
                                    {((seccionAjustes === 'cal' && colorCalendario === color) || 
                                      (seccionAjustes === 'int' && colorInterfaz === color) || 
                                      (seccionAjustes === 'exp' && colorExplore === color)) && (
                                        <Ionicons name="checkmark" size={18} color={color === '#ffffff' ? '#000' : '#fff'} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {seccionAjustes === 'bg' && (
                        <View style={s.bgSettings}>
                            <View style={s.bgMonthNav}>
                                <TouchableOpacity onPress={mesAjusteAnterior} style={s.bgNavBtn}>
                                    <Ionicons name="chevron-back" size={20} color="#fff" />
                                </TouchableOpacity>
                                <Text style={s.bgInfoText}>Mes: {MESES[mesAjusteFondo].toUpperCase()}</Text>
                                <TouchableOpacity onPress={mesAjusteSiguiente} style={s.bgNavBtn}>
                                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View style={s.bgPreviewContainer}>
                                <Image source={imagenPreviewAjuste} style={s.bgPreview} />
                            </View>
                            <View style={s.bgActionRow}>
                                <TouchableOpacity style={[s.bgActionBtn, { backgroundColor: colorCalendario }]} onPress={seleccionarImagen}>
                                    <Ionicons name="image-outline" size={18} color="#fff" />
                                    <Text style={s.bgActionBtnText}>CAMBIAR</Text>
                                </TouchableOpacity>
                                {fondosPersonalizados[mesAjusteFondo] && (
                                    <TouchableOpacity style={s.bgActionBtnRestore} onPress={restaurarImagenOriginal}>
                                        <Ionicons name="refresh-outline" size={18} color="#fff" />
                                        <Text style={s.bgActionBtnText}>ORIGINAL</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    <TouchableOpacity style={[s.closeBtn, { backgroundColor: colorInterfaz + '20' }]} onPress={() => setMenuVisible(false)}>
                        <Text style={[s.closeBtnText, { color: colorInterfaz }]}>GUARDAR CAMBIOS</Text>
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
                    <Text style={[s.modalTitle, { color: colorCalendario }]}>NUEVO EVENTO</Text>
                    <Text style={s.modalSub}>{diaSeleccionado} de {MESES[mes]}</Text>
                    <TextInput 
                        style={[s.input, { borderColor: colorCalendario + '40' }]}
                        placeholder="Nombre del evento..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={nuevoEventoTexto}
                        onChangeText={setNuevoEventoTexto}
                        autoFocus
                    />
                    <View style={s.modalBtnRow}>
                        <TouchableOpacity style={[s.actionBtn, { backgroundColor: colorCalendario }]} onPress={guardarEvento}>
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
  titleText: { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  koreanText: { fontSize: 14, fontWeight: '600' },

  sideNavBtn: { position: 'absolute', top: height / 2 - 25, zIndex: 110, width: 50, height: 50 },
  sideNavCard: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', padding: 0 },

  hideUiBtn: { alignSelf: 'center', marginTop: -10, marginBottom: 20 },
  hideUiInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  hideUiText: { fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },

  restoreUiBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 100 },
  restoreUiCard: { paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 25 },
  restoreUiText: { color: '#fff', fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },

  calendarCard: { marginBottom: 20, paddingVertical: 8 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 10 },
  navBtn: { padding: 5 },
  mesTitulo: { fontSize: 17, fontWeight: '800', letterSpacing: 1 },

  diasSemanaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  diaSemanaText: { fontSize: 11, fontWeight: '700', width: (width - 100) / 7, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  celda: { width: (width - 100) / 7, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  diaNum: { fontSize: 15 },
  btsIndicator: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  eventIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', marginTop: 2, position: 'absolute', bottom: 5 },

  eventsSection: { marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15, marginLeft: 5 },
  eventItem: { marginBottom: 12 },
  eventContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  eventIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  eventText: { fontSize: 16, fontWeight: '700' },
  eventDate: { fontSize: 12, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 450 },
  modalBottomContainer: { width: '100%', maxWidth: 400, position: 'absolute', bottom: 40 },
  modalCard: { padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 15, letterSpacing: 2 },
  modalSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '700', marginBottom: 20 },
  
  tabsScroll: { width: '100%', marginBottom: 25 },
  tab: { paddingVertical: 8, paddingHorizontal: 15 },
  tabText: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 30 },
  colorCircle: { width: 45, height: 45, borderRadius: 22.5, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  
  bgSettings: { width: '100%', alignItems: 'center', marginBottom: 30 },
  bgMonthNav: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 15 },
  bgNavBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },
  bgInfoText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  bgPreviewContainer: { width: 100, height: 160, borderRadius: 15, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 20 },
  bgPreview: { width: '100%', height: '100%' },
  bgActionRow: { flexDirection: 'row', gap: 15 },
  bgActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15 },
  bgActionBtnRestore: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)' },
  bgActionBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  input: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, color: '#fff', fontSize: 16, marginBottom: 25, borderWidth: 1 },
  modalBtnRow: { flexDirection: 'row', gap: 15, width: '100%' },
  actionBtn: { flex: 1, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  closeBtn: { width: '100%', height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontWeight: '900', letterSpacing: 1 },
});
