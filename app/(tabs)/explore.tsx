import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

const imgNoticias = require('../images/noticias.png');
const imgTienda = require('../images/tienda.png');
const imgDiploma = require('../images/diploma.png');
const imgQuizzes = require('../images/quizzes.jpg');
const imgHistorias = require('../images/historias.png');
const imgSubscriptores = require('../images/subscriptores.jpg');

export default function TabTwoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
            Explora el Universo Eter
          </ThemedText>
        </View>

        <ThemedText style={styles.subtitle}>
          Acceso rápido a todo el contenido de EterKpop MX.
        </ThemedText>

        <View style={styles.gridContainer}>
          <AccessCard title="Noticias"      imageSource={imgNoticias}      color="#3B82F6" url="https://eter-production-f148.up.railway.app/noticias"    delay={0}    />
          <AccessCard title="Tienda"        imageSource={imgTienda}        color="#EC4899" url="https://eter-production-f148.up.railway.app/tienda"       delay={200}  />
          <AccessCard title="Diplomas"      imageSource={imgDiploma}       color="#10B981" url="https://eter-production-f148.up.railway.app/diploma"      delay={400}  />
          <AccessCard title="Quizzes"       imageSource={imgQuizzes}       color="#F59E0B" url="https://eter-production-f148.up.railway.app/quizzes"      delay={600}  />
          <AccessCard title="Tu Historia"   imageSource={imgHistorias}     color="#EF4444" url="https://eter-production-f148.up.railway.app/historias"    delay={800}  />
          <AccessCard title="Contenido VIP" imageSource={imgSubscriptores} color="#8B5CF6" url="https://eter-production-f148.up.railway.app/suscriptores" delay={1000} />
        </View>

        <View style={styles.footerContainer}>
          <ThemedText style={styles.footerText}>DS - EterKpop MX</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function AccessCard({ title, imageSource, color, url, delay = 0 }: {
  title: string;
  imageSource: any;
  color: string;
  url: string;
  delay?: number;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Linking.openURL(url);
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [
            { translateY: floatAnim },
            { scale: pressAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        style={{ width: '100%', height: '100%' }}
      >
        <View style={[styles.card, { borderColor: color }]}>
          <Image
            source={imageSource}
            style={styles.cardImage}
            contentFit="cover"
          />
          <View style={styles.textOverlay}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              {title}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  titleContainer: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  subtitle: { marginBottom: 30, opacity: 0.7, fontSize: 15, lineHeight: 22 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '47%',
    height: 160,
    marginBottom: 15,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  cardTitle: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Fonts.rounded,
    color: '#FFF',
  },
  footerContainer: { alignItems: 'center', marginTop: 40, paddingBottom: 20 },
  footerText: { fontFamily: Fonts.rounded, opacity: 0.4, fontSize: 12, letterSpacing: 1 },
});