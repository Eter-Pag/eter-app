import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  morado: { principal: '#6c3483', fondo: '#0d0d1a', overlay: 'rgba(0,0,0,0.6)', celda: 'rgba(26,10,46,0.6)', borde: 'rgba(195,155,211,0.3)', texto: '#c39bd3', hoy: 'rgba(108,52,131,0.9)' },
  rosa:   { principal: '#c0396b', fondo: '#1a0a10', overlay: 'rgba(0,0,0,0.6)', celda: 'rgba(46,10,20,0.6)', borde: 'rgba(255,182,210,0.3)', texto: '#ffb6d2', hoy: 'rgba(192,57,107,0.9)' },
  blanco: { principal: '#aaaaaa', fondo: '#1a1a1a', overlay: 'rgba(0,0,0,0.6)', celda: 'rgba(40,40,40,0.6)', borde: 'rgba(255,255,255,0.3)', texto: '#ffffff', hoy: 'rgba(150,150,150,0.9)' },
  verde:  { principal: '#1e8449', fondo: '#0a1a0d', overlay: 'rgba(0,0,0,0.6)', celda: 'rgba(10,40,20,0.6)', borde: 'rgba(100,220,130,0.3)', texto: '#82e0aa', hoy: 'rgba(30,132,73,0.9)' },
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

  // ✅ Cargar datos guardados al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const eventosGuardados = await AsyncStorage.getItem(STORAGE_KEY);
        if (eventosGuardados) setEventos(JSON.parse(eventosGuardados));

        const temaGuardado = await AsyncStorage.getItem(STORAGE_TEMA);
        if (temaGuardado) setTema(temaGuardado);

        const fraseGuardada = await AsyncStorage.getItem(STORAGE_FRASE);
        if (fraseGuardada) setFrase(fraseGuardada);
      } catch (e) {
        console.log('Error cargando datos:', e);
      }
    };

    cargarDatos();
  }, []);

  // ✅ Pedir permisos de notificaciones
  useEffect(() => {
    const pedirPermisos = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Activa las notificaciones para usar recordatorios 💜');
      }
    };
    pedirPermisos();
  }, []);

  // ✅ Guardar eventos cada vez que cambian
  const guardarEventos = async (nuevosEventos) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosEventos));
      setEventos(nuevosEventos);
    } catch (e) {
      console.log('Error guardando eventos:', e);
    }
  };

  // ✅ Guardar tema cada vez que cambia
  const cambiarTema = async (nuevoTema) => {
    try {
      await AsyncStorage.setItem(STORAGE_TEMA, nuevoTema);
      setTema(nuevoTema);
    } catch (e) {
      console.log('Error guardando tema:', e);
    }
  };

  // ✅ Guardar frase cada vez que cambia
  const cambiarFrase = async (nuevaFrase) => {
    try {
      await AsyncStorage.setItem(STORAGE_FRASE, nuevaFrase);
      setFrase(nuevaFrase);
    } catch (e) {
      console.log('Error guardando frase:', e);
    }
  };

  const t = TEMAS[tema];

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
    <ScrollView style={[s.container, { backgroundColor: t.fondo }]}>
      <ImageBackground source={IMAGENES[mes]} style={s.imagenFondo} imageStyle={s.imagenEstilo}>
        <View style={[s.overlay, { backgroundColor: mostrarCalendario ? t.overlay : 'rgba(0,0,0,0)' }]}>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerEmoji}>💜✨💜</Text>
            <Text style={[s.titulo, { color: t.texto }]}>BTS ARMY Calendar</Text>
            <Text style={[s.subtitulo, { color: t.texto }]}>방탄소년단</Text>
            <TouchableOpacity style={s.menuBtn} onPress={() => setMenuVisible(!menuVisible)}>
              <Text style={[s.menuBtnText, { color: t.texto }]}>☰</Text>
            </TouchableOpacity>
          </View>

          {/* Menú desplegable */}
          {menuVisible && seccion === null && (
            <View style={[s.menuDropdown, { backgroundColor: t.fondo, borderColor: t.principal }]}>
              {[
                { id: 'buscar', label: '🔍 Buscar fecha' },
                { id: 'recordatorio', label: '⏰ Agregar recordatorio' },
                { id: 'personalizacion', label: '🎨 Personalización' },
                { id: 'bts', label: '💜 Fechas importantes BTS' },
                { id: 'eventos', label: '📋 Ver eventos del mes' },
              ].map(op => (
                <TouchableOpacity key={op.id} style={[s.menuOpcion, { borderBottomColor: t.borde }]} onPress={() => setSeccion(op.id)}>
                  <Text style={[s.menuOpcionText, { color: t.texto }]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={s.menuCerrar} onPress={() => setMenuVisible(false)}>
                <Text style={[s.menuCerrarText, { color: t.texto }]}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sección: Buscar */}
          {menuVisible && seccion === 'buscar' && (
            <View style={[s.seccionBox, { backgroundColor: t.fondo, borderColor: t.principal }]}>
              <Text style={[s.seccionTitulo, { color: t.texto }]}>🔍 Buscar evento</Text>
              <TextInput style={[s.input, { borderColor: t.principal, color: t.texto }]} placeholder="Escribe para buscar..." placeholderTextColor={t.borde} value={busqueda} onChangeText={setBusqueda} />
              <ScrollView style={{ maxHeight: 200 }}>
                {resultadosBusqueda.map(([clave, evs]) => (
                  <View key={clave} style={s.resultadoItem}>
                    <Text style={[s.resultadoFecha, { color: t.principal }]}>{clave}</Text>
                    {evs.map((e,i) => <Text key={i} style={[s.resultadoTexto, { color: t.texto }]}>• {e}</Text>)}
                  </View>
                ))}
                {busqueda.trim() && resultadosBusqueda.length === 0 && (
                  <Text style={[s.resultadoTexto, { color: t.texto }]}>Sin resultados</Text>
                )}
              </ScrollView>
              <TouchableOpacity style={[s.btnVolver, { backgroundColor: t.principal }]} onPress={() => setSeccion(null)}>
                <Text style={s.btnVolverText}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sección: Recordatorio */}
          {menuVisible && seccion === 'recordatorio' && (
            <View style={[s.seccionBox, { backgroundColor: t.fondo, borderColor: t.principal }]}>
              <Text style={[s.seccionTitulo, { color: t.texto }]}>⏰ Agregar recordatorio</Text>
              <TextInput style={[s.input, { borderColor: t.principal, color: t.texto }]} placeholder="Día (ej: 15)" placeholderTextColor={t.borde} value={recDia} onChangeText={setRecDia} keyboardType="numeric" />
              <TextInput style={[s.input, { borderColor: t.principal, color: t.texto, marginTop: 8 }]} placeholder="Mes (ej: 4)" placeholderTextColor={t.borde} value={recMes} onChangeText={setRecMes} keyboardType="numeric" />
              <TextInput style={[s.input, { borderColor: t.principal, color: t.texto, marginTop: 8 }]} placeholder="Hora (ej: 14:30) opcional" placeholderTextColor={t.borde} value={recHora} onChangeText={setRecHora} />
              <TextInput style={[s.input, { borderColor: t.principal, color: t.texto, marginTop: 8 }]} placeholder="Descripción del evento..." placeholderTextColor={t.borde} value={recTexto} onChangeText={setRecTexto} />
              <TouchableOpacity style={[s.btnAgregar, { backgroundColor: t.principal, marginTop: 10 }]} onPress={agregarRecordatorio}>
                <Text style={s.btnText}>💜 Guardar recordatorio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnVolver, { backgroundColor: t.principal, marginTop: 8 }]} onPress={() => setSeccion(null)}>
                <Text style={s.btnVolverText}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sección: Personalización */}
          {menuVisible && seccion === 'personalizacion' && (
            <View style={[s.seccionBox, { backgroundColor: t.fondo, borderColor: t.principal }]}>
              <Text style={[s.seccionTitulo, { color: t.texto }]}>🎨 Personalización</Text>
              <Text style={[s.seccionLabel, { color: t.texto }]}>Color del tema:</Text>
              <View style={s.temasRow}>
                {[
                  { id: 'morado', color: '#6c3483', label: '💜 Morado' },
                  { id: 'rosa',   color: '#c0396b', label: '🩷 Rosa' },
                  { id: 'blanco', color: '#aaaaaa', label: '🤍 Blanco' },
                  { id: 'verde',  color: '#1e8449', label: '💚 Verde' },
                ].map(tm => (
                  <TouchableOpacity key={tm.id} style={[s.temaBtn, { backgroundColor: tm.color, borderWidth: tema === tm.id ? 3 : 0, borderColor: '#fff' }]} onPress={() => cambiarTema(tm.id)}>
                    <Text style={s.temaBtnText}>{tm.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[s.seccionLabel, { color: t.texto, marginTop: 12 }]}>Frase BTS:</Text>
              {FRASES_BTS.map((f, i) => (
                <TouchableOpacity key={i} style={[s.fraseOpcion, { borderColor: frase === f ? t.principal : t.borde }]} onPress={() => cambiarFrase(f)}>
                  <Text style={[s.fraseOpcionText, { color: frase === f ? t.texto : 'rgba(255,255,255,0.5)' }]}>{f}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[s.btnVolver, { backgroundColor: t.principal, marginTop: 10 }]} onPress={() => { setSeccion(null); setMenuVisible(false); }}>
                <Text style={s.btnVolverText}>✓ Listo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sección: Fechas BTS */}
          {menuVisible && seccion === 'bts' && (
            <View style={[s.seccionBox, { backgroundColor: t.fondo, borderColor: t.principal }]}>
              <Text style={[s.seccionTitulo, { color: t.texto }]}>💜 Fechas importantes BTS</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {FECHAS_BTS.map((f, i) => (
                  <View key={i} style={[s.fechaBTSItem, { borderBottomColor: t.borde }]}>
                    <Text style={[s.fechaBTSDia, { color: t.principal }]}>{f.dia} de {MESES[f.mes]}</Text>
                    <Text style={[s.fechaBTSTexto, { color: t.texto }]}>{f.texto}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={[s.btnVolver, { backgroundColor: t.principal, marginTop: 10 }]} onPress={() => setSeccion(null)}>
                <Text style={s.btnVolverText}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sección: Eventos del mes */}
          {menuVisible && seccion === 'eventos' && (
            <View style={[s.seccionBox, { backgroundColor: t.fondo, borderColor: t.principal }]}>
              <Text style={[s.seccionTitulo, { color: t.texto }]}>📋 Eventos de {MESES[mes]}</Text>
              <ScrollView style={{ maxHeight: 250 }}>
                {eventosMes.length === 0 && <Text style={[s.resultadoTexto, { color: t.texto }]}>Sin eventos este mes</Text>}
                {eventosMes.map(([clave, evs]) => {
                  const dia = clave.split('-')[2];
                  return (
                    <View key={clave} style={[s.fechaBTSItem, { borderBottomColor: t.borde }]}>
                      <Text style={[s.fechaBTSDia, { color: t.principal }]}>Día {dia}</Text>
                      {evs.map((e,i) => <Text key={i} style={[s.fechaBTSTexto, { color: t.texto }]}>• {e}</Text>)}
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={[s.btnVolver, { backgroundColor: t.principal, marginTop: 10 }]} onPress={() => setSeccion(null)}>
                <Text style={s.btnVolverText}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Calendario */}
          {mostrarCalendario && !menuVisible && (
            <View>
              <View style={s.navRow}>
                <TouchableOpacity onPress={mesAnterior} style={[s.navBoton, { backgroundColor: `${t.principal}99` }]}>
                  <Text style={[s.navBtn, { color: t.texto }]}>◀</Text>
                </TouchableOpacity>
                <View style={s.mesContainer}>
                  <Text style={[s.mesAnio, { color: '#fff' }]}>{MESES[mes]}</Text>
                  <Text style={[s.anioText, { color: t.texto }]}>{anio}</Text>
                </View>
                <TouchableOpacity onPress={mesSiguiente} style={[s.navBoton, { backgroundColor: `${t.principal}99` }]}>
                  <Text style={[s.navBtn, { color: t.texto }]}>▶</Text>
                </TouchableOpacity>
              </View>

              <View style={s.diasRow}>
                {DIAS.map(d => <Text key={d} style={[s.diaNombre, { color: t.texto }]}>{d}</Text>)}
              </View>

              <View style={s.grid}>
                {celdas.map((dia, i) => {
                  const clave = `${anio}-${mes}-${dia}`;
                  const tieneEvento = dia && eventos[clave]?.length > 0;
                  const esBTS = dia && tieneFechaBTS(dia);
                  const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
                  return (
                    <TouchableOpacity key={i} style={[s.celda, { backgroundColor: t.celda, borderColor: t.borde }, esHoy && { backgroundColor: t.hoy, borderColor: t.texto, borderWidth: 2 }, esBTS && { borderColor: t.principal, borderWidth: 2 }]} onPress={() => dia && abrirDia(dia)}>
                      <Text style={[s.diaNum, { color: '#fff' }, esHoy && { fontWeight: 'bold' }]}>{dia || ''}</Text>
                      {esBTS && <Text style={{ fontSize: 7 }}>⭐</Text>}
                      {tieneEvento && <Text style={{ fontSize: 7 }}>💜</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[s.fraseContainer, { backgroundColor: 'rgba(26,10,46,0.7)', borderColor: t.borde }]}>
                <Text style={[s.frase, { color: t.texto }]}>{frase}</Text>
                <Text style={[s.fraseSubtitulo, { color: t.texto }]}>— BTS</Text>
              </View>
            </View>
          )}
          
{!menuVisible && (
  <TouchableOpacity 
    style={[s.btnToggle, !mostrarCalendario && { marginTop: 420 }]} 
    onPress={() => setMostrarCalendario(!mostrarCalendario)}
  >
    <Text style={s.btnToggleText}>{mostrarCalendario ? '🖼️ ver foto' : '📅 ver calendario'}</Text>
  </TouchableOpacity>
)}

          {!menuVisible && (
            <TouchableOpacity style={[s.btnToggle, { marginTop: 10 }]} onPress={() => setModalDisclaimer(true)}>
              <Text style={s.btnToggleText}>⚠️ Aviso legal</Text>
            </TouchableOpacity>
          )}

          {!mostrarCalendario && !menuVisible && <View style={s.espacioFoto} />}

        </View>
      </ImageBackground>

      {/* Modal de eventos */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalFondo}>
          <View style={[s.modalCaja, { backgroundColor: t.fondo, borderColor: t.principal }]}>
            <Text style={s.modalEmoji}>💜✨</Text>
            <Text style={[s.modalTitulo, { color: t.texto }]}>{diaSeleccionado} de {MESES[mes]}</Text>
            {tieneFechaBTS(diaSeleccionado) && (
              <Text style={[s.fechaBTSTexto, { color: t.principal, marginBottom: 8, textAlign: 'center' }]}>
                {fechaBTS(diaSeleccionado)?.texto}
              </Text>
            )}
            <ScrollView style={{ maxHeight: 150 }}>
              {(eventos[`${anio}-${mes}-${diaSeleccionado}`] || []).map((e, i) => (
                <Text key={i} style={[s.eventoItem, { color: t.texto }]}>💜 {e}</Text>
              ))}
            </ScrollView>
            <TextInput style={[s.input, { borderColor: t.principal, color: t.texto }]} placeholder="Agregar evento ARMY... 🎵" placeholderTextColor={t.borde} value={nuevoEvento} onChangeText={setNuevoEvento} />
            <TouchableOpacity style={[s.btnAgregar, { backgroundColor: t.principal }]} onPress={agregarEvento}>
              <Text style={s.btnText}>💜 Agregar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btnCerrar, { backgroundColor: '#2d1b4e' }]} onPress={() => setModalVisible(false)}>
              <Text style={s.btnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Disclaimer */}
      <Modal visible={modalDisclaimer} transparent animationType="fade">
        <View style={s.modalFondo}>
          <View style={[s.modalCaja, { backgroundColor: t.fondo, borderColor: t.principal }]}>
            <Text style={[s.modalTitulo, { color: t.texto }]}>⚠️ Aviso Legal</Text>
            <ScrollView style={{ maxHeight: 250 }}>
              <Text style={{ color: t.texto, fontSize: 14, lineHeight: 20 }}>
                Esta aplicación es un proyecto de fans sin fines de lucro.
                {'\n\n'}Todo el contenido relacionado con BTS, incluyendo imágenes, nombres y referencias, pertenece a sus respectivos propietarios.
                {'\n\n'}No se reclama propiedad sobre ningún material oficial. Este proyecto es únicamente para fines de entretenimiento y comunidad.
                {'\n\n'}Si eres propietario de algún contenido y deseas que sea retirado, puedes contactarnos y será eliminado lo antes posible.
              </Text>
            </ScrollView>
            <TouchableOpacity style={[s.btnCerrar, { backgroundColor: t.principal }]} onPress={() => setModalDisclaimer(false)}>
              <Text style={s.btnText}>Entendido 💜</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  imagenFondo: { width: '100%', minHeight: '100%' },
  imagenEstilo: { resizeMode: 'cover' },
  overlay: { flex: 1, paddingBottom: 30 },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 20 },
  headerEmoji: { fontSize: 28, marginBottom: 6 },
  titulo: { fontSize: 26, fontWeight: 'bold', letterSpacing: 2 },
  subtitulo: { fontSize: 14, marginTop: 4, letterSpacing: 4 },
  menuBtn: { position: 'absolute', right: 16, top: 50, padding: 10 },
  menuBtnText: { fontSize: 28, fontWeight: 'bold' },
  menuDropdown: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 10 },
  menuOpcion: { padding: 14, borderBottomWidth: 1 },
  menuOpcionText: { fontSize: 15 },
  menuCerrar: { padding: 12, alignItems: 'center' },
  menuCerrarText: { fontSize: 13, opacity: 0.6 },
  seccionBox: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 10 },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  seccionLabel: { fontSize: 14, marginBottom: 6 },
  temasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  temaBtn: { borderRadius: 10, padding: 10, margin: 4 },
  temaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  fraseOpcion: { borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 6 },
  fraseOpcionText: { fontSize: 13 },
  resultadoItem: { marginBottom: 10 },
  resultadoFecha: { fontWeight: 'bold', fontSize: 13 },
  resultadoTexto: { fontSize: 13, marginLeft: 8 },
  fechaBTSItem: { paddingVertical: 8, borderBottomWidth: 1 },
  fechaBTSDia: { fontWeight: 'bold', fontSize: 14 },
  fechaBTSTexto: { fontSize: 13, marginTop: 2 },
  btnVolver: { borderRadius: 10, padding: 12, alignItems: 'center' },
  btnVolverText: { color: '#fff', fontWeight: 'bold' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16, paddingHorizontal: 20 },
  navBoton: { borderRadius: 20, padding: 10 },
  navBtn: { fontSize: 18 },
  mesContainer: { alignItems: 'center' },
  mesAnio: { fontSize: 28, fontWeight: 'bold' },
  anioText: { fontSize: 14 },
  diasRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8, paddingHorizontal: 4 },
  diaNombre: { width: '13%', textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 },
  celda: { width: '13%', aspectRatio: 1, margin: '0.5%', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  diaNum: { fontSize: 13 },
  fraseContainer: { alignItems: 'center', marginTop: 24, marginHorizontal: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
  frase: { fontSize: 16, fontStyle: 'italic', textAlign: 'center' },
  fraseSubtitulo: { fontSize: 12, marginTop: 4 },
  btnToggle: { alignSelf: 'center', marginTop: 20, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(106,52,131,0.3)', borderWidth: 1, borderColor: 'rgba(195,155,211,0.2)' },
  btnToggleText: { color: 'rgba(195,155,211,0.6)', fontSize: 12 },
  espacioFoto: { height: 500 },
  modalFondo: { flex: 1, backgroundColor: '#00000099', justifyContent: 'center', padding: 24 },
  modalCaja: { borderRadius: 20, padding: 24, borderWidth: 1 },
  modalEmoji: { textAlign: 'center', fontSize: 24, marginBottom: 8 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  eventoItem: { fontSize: 15, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 12, fontSize: 15, backgroundColor: 'rgba(0,0,0,0.3)' },
  btnAgregar: { borderRadius: 10, padding: 14, marginTop: 12, alignItems: 'center' },
  btnCerrar: { borderRadius: 10, padding: 14, marginTop: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});