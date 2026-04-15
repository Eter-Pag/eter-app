import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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

const TEMAS = {
  morado: { principal: '#9b59b6', fondo: '#0d0d1a', overlay: 'rgba(0,0,0,0.4)', celda: 'rgba(255,255,255,0.1)', borde: 'rgba(195,155,211,0.2)', texto: '#e8daef', hoy: '#6c3483', acento: '#d7bde2' },
  rosa:   { principal: '#ec407a', fondo: '#1a0a10', overlay: 'rgba(0,0,0,0.4)', celda: 'rgba(255,255,255,0.1)', borde: 'rgba(255,182,210,0.2)', texto: '#fce4ec', hoy: '#c2185b', acento: '#f8bbd0' },
  oscuro: { principal: '#ffffff', fondo: '#121212', overlay: 'rgba(0,0,0,0.6)', celda: 'rgba(255,255,255,0.05)', borde: 'rgba(255,255,255,0.1)', texto: '#f5f5f5', hoy: '#333333', acento: '#888888' },
};

const FRASES_BTS = [
  '"Life goes on" 💜',
  '"You need to love yourself" 💜',
  '"No matter who you are, where you\'re from 💜"',
  '"We are bulletproof" 💜',
  '"Boy with luv" 💜',
  '"Dionysus" 💜',
];

const STORAGE_KEY = '@bts_eventos';
const STORAGE_TEMA = '@bts_tema';
const STORAGE_FRASE = '@bts_frase';

export default function Calendario() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [eventos, setEventos] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [seccion, setSeccion] = useState(null);
  const [tema, setTema] = useState('morado');
  const [frase, setFrase] = useState(FRASES_BTS[0]);
  const [busqueda, setBusqueda] = useState('');
  const [recDia, setRecDia] = useState('');
  const [recMes, setRecMes] = useState('');
  const [recHora, setRecHora] = useState('');
  const [recTexto, setRecTexto] = useState('');
  const [modalDisclaimer, setModalDisclaimer] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const eventosGuardados = await AsyncStorage.getItem(STORAGE_KEY);
        if (eventosGuardados) setEventos(JSON.parse(eventosGuardados));
        const temaGuardado = await AsyncStorage.getItem(STORAGE_TEMA);
        if (temaGuardado) setTema(temaGuardado === 'blanco' ? 'oscuro' : temaGuardado);
        const fraseGuardada = await AsyncStorage.getItem(STORAGE_FRASE);
        if (fraseGuardada) setFrase(fraseGuardada);
      } catch (e) { console.log('Error cargando datos:', e); }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const pedirPermisos = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') console.log('Notificaciones desactivadas 💜');
    };
    pedirPermisos();
  }, []);

  const guardarEventos = async (nuevosEventos) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosEventos));
      setEventos(nuevosEventos);
    } catch (e) { console.log('Error guardando eventos:', e); }
  };

  const cambiarTema = async (nuevoTema) => {
    try {
      await AsyncStorage.setItem(STORAGE_TEMA, nuevoTema);
      setTema(nuevoTema);
    } catch (e) { console.log('Error guardando tema:', e); }
  };

  const cambiarFrase = async (nuevaFrase) => {
    try {
      await AsyncStorage.setItem(STORAGE_FRASE, nuevaFrase);
      setFrase(nuevaFrase);
    } catch (e) { console.log('Error guardando frase:', e); }
  };

  const t = TEMAS[tema] || TEMAS.morado;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDia = new Date(anio, mes, 1).getDay();

  const mesAnterior = () => { if (mes === 0) { setMes(11); setAnio(anio-1); } else setMes(mes-1); };
  const mesSiguiente = () => { if (mes === 11) { setMes(0); setAnio(anio+1); } else setMes(mes+1); };

  const abrirDia = (dia) => { setDiaSeleccionado(dia); setModalVisible(true); };

  const agregarEvento = () => {
    if (!nuevoEvento.trim()) return;
    const clave = `${anio}-${mes}-${diaSeleccionado}`;
    const nuevosEventos = { ...eventos, [clave]: [...(eventos[clave] || []), nuevoEvento] };
    guardarEventos(nuevosEventos);
    setNuevoEvento('');
  };

  const agregarRecordatorio = () => {
    if (!recTexto.trim() || !recDia || !recMes) return;
    const m = parseInt(recMes) - 1;
    const d = parseInt(recDia);
    const clave = `${anio}-${m}-${d}`;
    const texto = recHora ? `⏰ ${recHora} - ${recTexto}` : `📌 ${recTexto}`;
    const nuevosEventos = { ...eventos, [clave]: [...(eventos[clave] || []), texto] };
    guardarEventos(nuevosEventos);
    setRecDia(''); setRecMes(''); setRecHora(''); setRecTexto('');
    setSeccion(null); setMenuVisible(false);
  };

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const fechaBTS = (d) => FECHAS_BTS.find(f => f.mes === mes && f.dia === d);
  const tieneFechaBTS = (d) => !!fechaBTS(d);
  const eventosMes = Object.entries(eventos).filter(([k]) => k.startsWith(`${anio}-${mes}-`));
  const resultadosBusqueda = busqueda.trim()
    ? Object.entries(eventos).filter(([k,v]) => v.some(e => e.toLowerCase().includes(busqueda.toLowerCase())))
    : [];

  return (
    <View style={[s.container, { backgroundColor: t.fondo }]}>
      <ImageBackground source={IMAGENES[mes]} style={s.imagenFondo} imageStyle={s.imagenEstilo}>
        <LinearGradient colors={[t.overlay, 'rgba(0,0,0,0.2)', t.overlay]} style={s.gradientOverlay}>
          
          {/* Header Glassmorphism */}
          <Animated.View entering={SlideInUp.duration(800)} style={s.headerContainer}>
            <BlurView intensity={Platform.OS === 'ios' ? 40 : 80} tint="dark" style={s.headerBlur}>
              <View style={s.headerContent}>
                <View>
                  <Text style={[s.titulo, { color: t.principal }]}>BTS CALENDAR</Text>
                  <Text style={[s.subtitulo, { color: t.acento }]}>방탄소년단 • PRO v2.0</Text>
                </View>
                <TouchableOpacity style={s.menuBtn} onPress={() => setMenuVisible(!menuVisible)}>
                  <Text style={[s.menuBtnText, { color: t.principal }]}>☰</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
            
            {/* Menú y Secciones con Animación */}
            {menuVisible && (
              <Animated.View entering={FadeInDown.duration(400)} style={s.seccionWrapper}>
                <BlurView intensity={60} tint="dark" style={s.glassCard}>
                  {seccion === null ? (
                    <View style={s.menuGrid}>
                      {[
                        { id: 'buscar', label: '🔍 Buscar', icon: '🔍' },
                        { id: 'recordatorio', label: '⏰ Recordar', icon: '⏰' },
                        { id: 'personalizacion', label: '🎨 Temas', icon: '🎨' },
                        { id: 'bts', label: '💜 BTS Dates', icon: '💜' },
                        { id: 'eventos', label: '📋 Eventos', icon: '📋' },
                      ].map(op => (
                        <TouchableOpacity key={op.id} style={s.menuGridItem} onPress={() => setSeccion(op.id)}>
                          <Text style={s.menuGridIcon}>{op.icon}</Text>
                          <Text style={[s.menuGridLabel, { color: t.texto }]}>{op.label}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={s.menuCerrarBtn} onPress={() => setMenuVisible(false)}>
                        <Text style={[s.menuCerrarText, { color: t.acento }]}>Cerrar ✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={s.seccionContent}>
                      <TouchableOpacity onPress={() => setSeccion(null)} style={s.backBtn}>
                        <Text style={[s.backBtnText, { color: t.principal }]}>← Volver</Text>
                      </TouchableOpacity>
                      
                      {seccion === 'personalizacion' && (
                        <View>
                          <Text style={[s.seccionTitulo, { color: t.principal }]}>Personalización</Text>
                          <View style={s.temasRow}>
                            {Object.keys(TEMAS).map(id => (
                              <TouchableOpacity key={id} style={[s.temaCirculo, { backgroundColor: TEMAS[id].principal, borderColor: tema === id ? '#fff' : 'transparent' }]} onPress={() => cambiarTema(id)} />
                            ))}
                          </View>
                          <ScrollView style={s.frasesList}>
                            {FRASES_BTS.map((f, i) => (
                              <TouchableOpacity key={i} style={[s.fraseOpcion, { backgroundColor: frase === f ? 'rgba(255,255,255,0.1)' : 'transparent' }]} onPress={() => cambiarFrase(f)}>
                                <Text style={[s.fraseOpcionText, { color: frase === f ? t.principal : t.texto }]}>{f}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}

                      {seccion === 'bts' && (
                        <ScrollView style={s.listContainer}>
                          <Text style={[s.seccionTitulo, { color: t.principal }]}>Fechas BTS</Text>
                          {FECHAS_BTS.map((f, i) => (
                            <View key={i} style={s.listItem}>
                              <Text style={[s.listItemDate, { color: t.principal }]}>{f.dia} {MESES[f.mes]}</Text>
                              <Text style={[s.listItemText, { color: t.texto }]}>{f.texto}</Text>
                            </View>
                          ))}
                        </ScrollView>
                      )}
                      
                      {/* Otras secciones se pueden simplificar o mantener */}
                    </View>
                  )}
                </BlurView>
              </Animated.View>
            )}

            {/* Calendario Principal */}
            {mostrarCalendario && !menuVisible && (
              <Animated.View entering={FadeIn.delay(200).duration(1000)}>
                <BlurView intensity={50} tint="dark" style={s.calendarCard}>
                  {/* Navegación Mes */}
                  <View style={s.navRow}>
                    <TouchableOpacity onPress={mesAnterior} style={s.navBoton}>
                      <Text style={[s.navBtnText, { color: t.principal }]}>◀</Text>
                    </TouchableOpacity>
                    <View style={s.mesInfo}>
                      <Text style={s.mesTexto}>{MESES[mes].toUpperCase()}</Text>
                      <Text style={[s.anioTexto, { color: t.principal }]}>{anio}</Text>
                    </View>
                    <TouchableOpacity onPress={mesSiguiente} style={s.navBoton}>
                      <Text style={[s.navBtnText, { color: t.principal }]}>▶</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Días Semana */}
                  <View style={s.diasSemanaRow}>
                    {DIAS.map(d => <Text key={d} style={[s.diaSemanaText, { color: t.acento }]}>{d}</Text>)}
                  </View>

                  {/* Grid de Días */}
                  <View style={s.grid}>
                    {celdas.map((dia, i) => {
                      const clave = `${anio}-${mes}-${dia}`;
                      const tieneEvento = dia && eventos[clave]?.length > 0;
                      const esBTS = dia && tieneFechaBTS(dia);
                      const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
                      
                      return (
                        <TouchableOpacity 
                          key={i} 
                          disabled={!dia}
                          style={[
                            s.celda, 
                            { backgroundColor: t.celda, borderColor: t.borde },
                            esHoy && { backgroundColor: t.hoy, borderColor: t.principal, borderWidth: 1.5 },
                            esBTS && { borderColor: t.principal, borderBottomWidth: 3 }
                          ]} 
                          onPress={() => dia && abrirDia(dia)}
                        >
                          <Text style={[s.diaNum, { color: dia ? '#fff' : 'transparent' }, esHoy && { fontWeight: '900' }]}>{dia || ''}</Text>
                          <View style={s.indicadores}>
                            {esBTS && <View style={[s.punto, { backgroundColor: t.principal }]} />}
                            {tieneEvento && <View style={[s.punto, { backgroundColor: '#fff' }]} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </BlurView>

                {/* Frase del Día Glassmorphism */}
                <BlurView intensity={30} tint="dark" style={s.fraseCard}>
                  <Text style={s.fraseEmoji}>“</Text>
                  <Text style={[s.fraseTexto, { color: t.texto }]}>{frase}</Text>
                  <Text style={[s.fraseAutor, { color: t.principal }]}>— BTS ARMY PRO</Text>
                </BlurView>
              </Animated.View>
            )}

            {/* Botones Flotantes */}
            <View style={s.footerButtons}>
              <TouchableOpacity style={s.glassBtn} onPress={() => setMostrarCalendario(!mostrarCalendario)}>
                <BlurView intensity={80} tint="dark" style={s.btnBlur}>
                  <Text style={s.btnText}>{mostrarCalendario ? '🖼️ VER FOTO' : '📅 CALENDARIO'}</Text>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={s.glassBtn} onPress={() => setModalDisclaimer(true)}>
                <BlurView intensity={80} tint="dark" style={s.btnBlur}>
                  <Text style={s.btnText}>⚠️ AVISO</Text>
                </BlurView>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </LinearGradient>
      </ImageBackground>

      {/* Modal Moderno */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={s.modalContent}>
            <LinearGradient colors={['rgba(155,89,182,0.2)', 'transparent']} style={s.modalGradient}>
              <Text style={[s.modalTitle, { color: t.principal }]}>{diaSeleccionado} {MESES[mes]}</Text>
              
              {tieneFechaBTS(diaSeleccionado) && (
                <View style={s.btsBadge}>
                  <Text style={s.btsBadgeText}>{fechaBTS(diaSeleccionado)?.texto}</Text>
                </View>
              )}

              <ScrollView style={s.eventosScroll}>
                {(eventos[`${anio}-${mes}-${diaSeleccionado}`] || []).map((e, i) => (
                  <View key={i} style={s.eventoCard}>
                    <Text style={s.eventoBullet}>💜</Text>
                    <Text style={[s.eventoText, { color: t.texto }]}>{e}</Text>
                  </View>
                ))}
              </ScrollView>

              <TextInput 
                style={[s.modalInput, { borderColor: t.borde, color: t.texto }]} 
                placeholder="Añadir nota ARMY..." 
                placeholderTextColor={t.acento} 
                value={nuevoEvento} 
                onChangeText={setNuevoEvento} 
              />

              <View style={s.modalButtons}>
                <TouchableOpacity style={[s.modalBtn, { backgroundColor: t.principal }]} onPress={agregarEvento}>
                  <Text style={s.modalBtnText}>GUARDAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.modalBtnClose} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: t.acento }}>CERRAR</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  imagenFondo: { width: '100%', height: '100%' },
  imagenEstilo: { resizeMode: 'cover' },
  gradientOverlay: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 120, paddingBottom: 100 },
  
  // Header
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerBlur: { paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 15, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25 },
  titulo: { fontSize: 22, fontWeight: '900', letterSpacing: 1.5 },
  subtitulo: { fontSize: 10, fontWeight: '600', letterSpacing: 2, marginTop: 2 },
  menuBtn: { padding: 5 },
  menuBtnText: { fontSize: 26 },

  // Cards
  glassCard: { borderRadius: 25, padding: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  calendarCard: { borderRadius: 30, padding: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 20 },
  fraseCard: { borderRadius: 20, padding: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },

  // Menu Grid
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuGridItem: { width: '30%', alignItems: 'center', marginVertical: 15 },
  menuGridIcon: { fontSize: 24, marginBottom: 8 },
  menuGridLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  menuCerrarBtn: { width: '100%', alignItems: 'center', marginTop: 10, padding: 10 },
  menuCerrarText: { fontSize: 12, fontWeight: 'bold' },

  // Calendar Components
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  navBoton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 18 },
  mesInfo: { alignItems: 'center' },
  mesTexto: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 3 },
  anioTexto: { fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  diasSemanaRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  diaSemanaText: { fontSize: 11, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  celda: { width: (width - 100) / 7, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 0.5 },
  diaNum: { fontSize: 15 },
  indicadores: { flexDirection: 'row', position: 'absolute', bottom: 5 },
  punto: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 1 },

  // Frase
  fraseEmoji: { fontSize: 40, color: 'rgba(255,255,255,0.2)', position: 'absolute', top: 5, left: 15 },
  fraseTexto: { fontSize: 16, textAlign: 'center', fontStyle: 'italic', fontWeight: '500', lineHeight: 24 },
  fraseAutor: { fontSize: 12, fontWeight: '900', marginTop: 10, letterSpacing: 1 },

  // Footer
  footerButtons: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 25 },
  glassBtn: { borderRadius: 15, overflow: 'hidden', width: 140 },
  btnBlur: { paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 },
  modalContent: { borderRadius: 35, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  modalGradient: { padding: 30 },
  modalTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  btsBadge: { backgroundColor: 'rgba(155,89,182,0.3)', padding: 10, borderRadius: 15, marginBottom: 20 },
  btsBadgeText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 13 },
  eventosScroll: { maxHeight: 200, marginBottom: 20 },
  eventoCard: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  eventoBullet: { marginRight: 10 },
  eventoText: { fontSize: 15, fontWeight: '500' },
  modalInput: { borderBottomWidth: 1, paddingVertical: 10, fontSize: 16, marginBottom: 25 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15 },
  modalBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  modalBtnClose: { padding: 10 },

  // Lists & Sections
  seccionWrapper: { marginBottom: 20 },
  seccionTitulo: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
  temasRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  temaCirculo: { width: 50, height: 50, borderRadius: 25, borderWidth: 3 },
  frasesList: { maxHeight: 200 },
  fraseOpcion: { padding: 12, borderRadius: 10, marginBottom: 5 },
  fraseOpcionText: { fontSize: 14, fontWeight: '600' },
  listContainer: { maxHeight: 300 },
  listItem: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  listItemDate: { fontSize: 12, fontWeight: '800', marginBottom: 2 },
  listItemText: { fontSize: 14, fontWeight: '500' },
  backBtn: { marginBottom: 15 },
  backBtnText: { fontWeight: '900', fontSize: 12 },
});
