import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.45; // 45% de la pantalla para la imagen de BTS

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
  morado: { principal: '#9b59b6', fondo: '#0d0d1a', overlay: 'rgba(0,0,0,0.4)', celda: 'rgba(255,255,255,0.08)', borde: 'rgba(195,155,211,0.2)', texto: '#e8daef', hoy: '#6c3483', acento: '#d7bde2' },
  rosa:   { principal: '#ec407a', fondo: '#1a0a10', overlay: 'rgba(0,0,0,0.4)', celda: 'rgba(255,255,255,0.08)', borde: 'rgba(255,182,210,0.2)', texto: '#fce4ec', hoy: '#c2185b', acento: '#f8bbd0' },
  oscuro: { principal: '#ffffff', fondo: '#121212', overlay: 'rgba(0,0,0,0.6)', celda: 'rgba(255,255,255,0.05)', borde: 'rgba(255,255,255,0.1)', texto: '#f5f5f5', hoy: '#333333', acento: '#888888' },
};

const STORAGE_KEY = '@bts_eventos';
const STORAGE_TEMA = '@bts_tema';

export default function Calendario() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [eventos, setEventos] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [tema, setTema] = useState('morado');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const eventosGuardados = await AsyncStorage.getItem(STORAGE_KEY);
        if (eventosGuardados) setEventos(JSON.parse(eventosGuardados));
        const temaGuardado = await AsyncStorage.getItem(STORAGE_TEMA);
        if (temaGuardado) setTema(temaGuardado);
      } catch (e) { console.log('Error cargando datos:', e); }
    };
    cargarDatos();
  }, []);

  const t = TEMAS[tema] || TEMAS.morado;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDia = new Date(anio, mes, 1).getDay();

  const mesAnterior = () => { if (mes === 0) { setMes(11); setAnio(anio-1); } else setMes(mes-1); };
  const mesSiguiente = () => { if (mes === 11) { setMes(0); setAnio(anio+1); } else setMes(mes+1); };

  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const fechaBTS = (d) => FECHAS_BTS.find(f => f.mes === mes && f.dia === d);
  const tieneFechaBTS = (d) => !!fechaBTS(d);

  return (
    <View style={[s.container, { backgroundColor: t.fondo }]}>
      
      {/* PARTE SUPERIOR: IMAGEN (Boceto Usuario) */}
      <View style={s.headerImageContainer}>
        <Image source={IMAGENES[mes]} style={s.headerImage} />
        <LinearGradient colors={['transparent', t.fondo]} style={s.imageGradient} />
        
        {/* Barra Superior (Título y Menú) */}
        <View style={s.topBar}>
          <View>
            <Text style={s.titleText}>bts calendario</Text>
            <Text style={s.koreanText}>방탄소년단 • ver v2.1</Text>
          </View>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={s.menuIconBtn}>
            <Text style={s.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PARTE INFERIOR: CALENDARIO (Boceto Usuario) */}
      <View style={s.calendarSection}>
        <BlurView intensity={20} tint="dark" style={s.calendarBlur}>
          
          {/* Navegación Mes */}
          <View style={s.navRow}>
            <TouchableOpacity onPress={mesAnterior} style={s.navBtn}>
              <Text style={[s.navBtnText, { color: t.principal }]}>◀</Text>
            </TouchableOpacity>
            <Text style={s.mesTitulo}>{MESES[mes].toUpperCase()} {anio}</Text>
            <TouchableOpacity onPress={mesSiguiente} style={s.navBtn}>
              <Text style={[s.navBtnText, { color: t.principal }]}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Días Semana */}
          <View style={s.diasSemanaRow}>
            {DIAS.map(d => <Text key={d} style={[s.diaSemanaText, { color: t.acento }]}>{d}</Text>)}
          </View>

          {/* Grid del Calendario */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.gridScroll}>
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
                      esHoy && { backgroundColor: t.hoy, borderColor: t.principal, borderWidth: 2 },
                      esBTS && { borderBottomColor: t.principal, borderBottomWidth: 3 }
                    ]} 
                    onPress={() => dia && { /* Lógica de abrir día */ }}
                  >
                    <Text style={[s.diaNum, { color: dia ? '#fff' : 'transparent' }, esHoy && { fontWeight: 'bold' }]}>{dia || ''}</Text>
                    {esBTS && <Text style={s.btsDot}>💜</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

        </BlurView>
      </View>

      {/* Menú Lateral (Modal) */}
      <Modal visible={menuVisible} transparent animationType="slide">
        <View style={s.menuOverlay}>
          <BlurView intensity={90} tint="dark" style={s.menuContent}>
            <Text style={[s.menuTitle, { color: t.principal }]}>CONFIGURACIÓN</Text>
            <TouchableOpacity style={s.menuItem} onPress={() => setMenuVisible(false)}>
              <Text style={s.menuItemText}>Cerrar ✕</Text>
            </TouchableOpacity>
            {/* Aquí puedes añadir más opciones de temas, etc. */}
          </BlurView>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  
  // Header Image (Boceto)
  headerImageContainer: { width: '100%', height: HEADER_HEIGHT, overflow: 'hidden' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  
  topBar: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleText: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  koreanText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginTop: 2 },
  menuIconBtn: { padding: 5 },
  menuIcon: { fontSize: 30, color: '#fff' },

  // Calendar Section (Boceto)
  calendarSection: { flex: 1, marginTop: -30, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  calendarBlur: { flex: 1, padding: 20 },
  
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  navBtn: { padding: 10 },
  navBtnText: { fontSize: 20 },
  mesTitulo: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2 },

  diasSemanaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 10 },
  diaSemanaText: { fontSize: 12, fontWeight: '800', width: (width - 60) / 7, textAlign: 'center' },

  gridScroll: { paddingBottom: 50 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  celda: { width: (width - 60) / 7, height: 55, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1 },
  diaNum: { fontSize: 16 },
  btsDot: { fontSize: 8, position: 'absolute', bottom: 5 },

  // Menu Modal
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuContent: { height: '50%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, alignItems: 'center' },
  menuTitle: { fontSize: 20, fontWeight: '900', marginBottom: 30 },
  menuItem: { padding: 15 },
  menuItemText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
