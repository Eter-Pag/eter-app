import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View, Dimensions, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const STORAGE_KEY_CONFIG = '@bts_config_temas';

export default function TabTwoScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const t = Colors[colorScheme];
  
  const [colorExplore, setColorExplore] = useState('#3b82f6');
  const [colorInterfaz, setColorInterfaz] = useState('#ffffff');

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const configGuardada = await AsyncStorage.getItem(STORAGE_KEY_CONFIG);
        if (configGuardada) {
            const config = JSON.parse(configGuardada);
            if (config.explore) setColorExplore(config.explore);
            if (config.interfaz) setColorInterfaz(config.interfaz);
        }
      } catch (e) { console.log('Error cargando config:', e); }
    };
    cargarConfig();
    const interval = setInterval(cargarConfig, 2000);
    return () => clearInterval(interval);
  }, []);

  const tools = [
    { title: "Noticias", desc: "Últimas novedades de BTS", icon: "newspaper", color: "#3B82F6", url: "https://eter-production-f148.up.railway.app/noticias" },
    { title: "Tienda", desc: "Merch oficial y más", icon: "cart", color: "#EC4899", url: "https://eter-production-f148.up.railway.app/tienda" },
    { title: "Diplomas", desc: "Tus logros ARMY", icon: "ribbon", color: "#10B981", url: "https://eter-production-f148.up.railway.app/diploma" },
    { title: "Quizzes", desc: "¿Cuánto sabes de ellos?", icon: "help-circle", color: "#F59E0B", url: "https://eter-production-f148.up.railway.app/quizzes" },
    { title: "Historias", desc: "Momentos inolvidables", icon: "chatbubbles", color: "#EF4444", url: "https://eter-production-f148.up.railway.app/historias" },
    { title: "Zona VIP", desc: "Contenido exclusivo", icon: "star", color: "#8B5CF6", url: "https://eter-production-f148.up.railway.app/suscriptores" },
  ];

  const handleOpenURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported || Platform.OS === 'web') {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error al abrir URL:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <LinearGradient colors={[colorExplore + '22', '#0d0d1a']} style={StyleSheet.absoluteFill} />
      
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <Text style={[styles.title, { color: colorExplore }]}>ETER WEB</Text>
          <Text style={[styles.subtitle, { color: colorInterfaz + '99' }]}>EterKpop MX Universe</Text>
        </Animated.View>

        <View style={styles.listContainer}>
          {tools.map((tool, index) => (
            <Animated.View 
              key={index} 
              entering={FadeInRight.delay(index * 100).duration(600)}
              style={styles.cardWrapper}
            >
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => handleOpenURL(tool.url)}
              >
                <GlassCard style={styles.card} intensity={20}>
                  <View style={styles.cardInner}>
                    <View style={[styles.iconBox, { backgroundColor: tool.color + '22' }]}>
                      <Ionicons name={tool.icon as any} size={28} color={tool.color} />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={[styles.cardTitle, { color: colorInterfaz }]}>{tool.title.toUpperCase()}</Text>
                      <Text style={[styles.cardDesc, { color: colorInterfaz + '88' }]}>{tool.desc}</Text>
                    </View>
                    <View style={styles.arrowContainer}>
                      <Ionicons name="chevron-forward" size={20} color={colorInterfaz + '44'} />
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colorInterfaz + '33' }]}>ETER KPOP MX • 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: 4 },
  subtitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: 5 },
  listContainer: { gap: 15 },
  cardWrapper: { width: '100%' },
  card: { borderRadius: 20 },
  cardInner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  cardDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  arrowContainer: { marginLeft: 10 },
  footer: { alignItems: 'center', marginTop: 40, paddingBottom: 20 },
  footerText: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
});
