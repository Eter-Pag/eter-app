import { Link } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/GlassCard';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#0d0d1a']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <GlassCard style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>ETER KPOP APP</Text>
          <Text style={styles.version}>Versión 2.5.0</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.description}>
              Esta aplicación está diseñada para la comunidad ARMY y fans del K-Pop. 
              Disfruta de calendarios personalizados, noticias en tiempo real y herramientas exclusivas.
            </Text>
          </View>

          <Link href="/" dismissTo style={styles.button}>
            <Text style={styles.buttonText}>ENTENDIDO</Text>
          </Link>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  version: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    marginBottom: 25,
  },
  infoSection: {
    width: '100%',
    marginBottom: 30,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  button: {
    backgroundColor: 'rgba(155, 89, 182, 0.6)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
