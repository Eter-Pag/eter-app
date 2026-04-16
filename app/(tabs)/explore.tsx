import { Image } from 'expo-image';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

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

  const tools = [
    { title: "Noticias", image: imgNoticias, icon: "newspaper-outline", color: "#3B82F6", url: "https://eter-production-f148.up.railway.app/noticias" },
    { title: "Tienda", image: imgTienda, icon: "cart-outline", color: "#EC4899", url: "https://eter-production-f148.up.railway.app/tienda" },
    { title: "Diplomas", image: imgDiploma, icon: "ribbon-outline", color: "#10B981", url: "https://eter-production-f148.up.railway.app/diploma" },
    { title: "Quizzes", image: imgQuizzes, icon: "help-circle-outline", color: "#F59E0B", url: "https://eter-production-f148.up.railway.app/quizzes" },
    { title: "Historias", image: imgHistorias, icon: "chatbubbles-outline", color: "#EF4444", url: "https://eter-production-f148.up.railway.app/historias" },
    { title: "Zona VIP", image: imgSubscriptores, icon: "star-outline", color: "#8B5CF6", url: "https://eter-production-f148.up.railway.app/suscriptores" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <LinearGradient colors={['#1a1a2e', '#0d0d1a']} style={StyleSheet.absoluteFill} />
      
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800)}>
          <Text style={styles.title}>EXPLORE</Text>
          <Text style={styles.subtitle}>EterKpop MX Universe</Text>
        </Animated.View>

        <View style={styles.gridContainer}>
          {tools.map((tool, index) => (
            <Animated.View 
              key={index} 
              entering={FadeInDown.delay(index * 100).duration(800)}
              style={styles.cardWrapper}
            >
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => Linking.openURL(tool.url)}
              >
                <GlassCard style={styles.card}>
                  <Image source={tool.image} style={styles.cardImage} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardOverlay} />
                  <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: tool.color + '40' }]}>
                      <Ionicons name={tool.icon as any} size={20} color={tool.color} />
                    </View>
                    <Text style={styles.cardTitle}>{tool.title}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ETER KPOP MX • 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: 30, letterSpacing: 1 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: (width - 55) / 2,
    marginBottom: 5,
  },
  card: {
    height: 180,
    padding: 0,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  footer: { alignItems: 'center', marginTop: 50, paddingBottom: 20 },
  footerText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
});
