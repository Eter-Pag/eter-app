import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View, Dimensions, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const STORAGE_KEY_CONFIG = '@bts_config_temas';

const imgNoticias = require('../images/noticias.png');
const imgTienda = require('../images/tienda.png');
const imgDiploma = require('../images/diploma.png');
const imgQuizzes = require('../images/quizzes.jpg');
const imgHistorias = require('../images/historias.png');
const imgSubscriptores = require('../images/subscriptores.jpg');

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
    
    // Escuchar cambios cada vez que la pantalla gana foco (opcional, pero útil)
    const interval = setInterval(cargarConfig, 2000);
    return () => clearInterval(interval);
  }, []);

  const tools = [
    { title: "Noticias", image: imgNoticias, icon: "newspaper-outline", color: "#3B82F6", url: "https://eter-production-f148.up.railway.app/noticias" },
    { title: "Tienda", image: imgTienda, icon: "cart-outline", color: "#EC4899", url: "https://eter-production-f148.up.railway.app/tienda" },
    { title: "Diplomas", image: imgDiploma, icon: "ribbon-outline", color: "#10B981", url: "https://eter-production-f148.up.railway.app/diploma" },
    { title: "Quizzes", image: imgQuizzes, icon: "help-circle-outline", color: "#F59E0B", url: "https://eter-production-f148.up.railway.app/quizzes" },
    { title: "Historias", image: imgHistorias, icon: "chatbubbles-outline", color: "#EF4444", url: "https://eter-production-f148.up.railway.app/historias" },
    { title: "Zona VIP", image: imgSubscriptores, icon: "star-outline", color: "#8B5CF6", url: "https://eter-production-f148.up.railway.app/suscriptores" },
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
      {/* Fondo dinámico basado en el color de Explore */}
      <LinearGradient colors={[colorExplore + '33', '#0d0d1a']} style={StyleSheet.absoluteFill} />
      
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800)}>
          <Text style={[styles.title, { color: colorExplore }]}>ETER WEB</Text>
          <Text style={[styles.subtitle, { color: colorInterfaz + '99' }]}>EterKpop MX Universe</Text>
        </Animated.View>

        <View style={styles.gridContainer}>
          {tools.map((tool, index) => (
            <Animated.View 
              key={index} 
              entering={FadeInDown.delay(index * 100).duration(800)}
              style={styles.cardWrapper}
            >
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => handleOpenURL(tool.url)}
                style={styles.touchable}
              >
                <GlassCard style={styles.card} intensity={40} noPadding>
                  <Image 
                    source={tool.image} 
                    style={styles.cardImage} 
                    contentFit="cover"
                    contentPosition="center"
                  />
                  <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']} style={styles.cardOverlay} />
                  <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: tool.color + '50' }]}>
                      <Ionicons name={tool.icon as any} size={22} color={tool.color} />
                    </View>
                    <Text style={[styles.cardTitle, { color: colorInterfaz }]}>{tool.title}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colorInterfaz + '4D' }]}>ETER KPOP MX • 2026</Text>
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  cardWrapper: {
    width: (width - 60) / 2,
    marginBottom: 20,
  },
  touchable: {
    width: '100%',
    height: 200,
  },
  card: {
    flex: 1,
    borderRadius: 24,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.9,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footer: { alignItems: 'center', marginTop: 50, paddingBottom: 20 },
  footerText: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
});
