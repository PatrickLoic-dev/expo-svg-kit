import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedIcon, type AnimatedIconHandle, type IconAnimationType } from 'expo-svg-kit/animated';

export interface AnimationsScreenProps {
  textColor: string;
  primaryColor: string;
}

const DEMOS: { animation: IconAnimationType; icon: string; label: string }[] = [
  { animation: 'spin', icon: 'refresh', label: 'spin (loops)' },
  { animation: 'pulse', icon: 'bell', label: 'pulse (loops)' },
  { animation: 'color', icon: 'heart', label: 'color (one-shot, tap to replay)' },
  { animation: 'draw', icon: 'check', label: 'draw (one-shot, tap to replay)' },
];

export function AnimationsScreen({
  textColor,
  primaryColor,
}: AnimationsScreenProps): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.hint, { color: textColor }]}>
        v0.3: Reanimated-powered animations, via `expo-svg-kit/animated`.
      </Text>
      <View style={styles.row}>
        {DEMOS.map((demo) => (
          <AnimationCard
            key={demo.animation}
            {...demo}
            textColor={textColor}
            primaryColor={primaryColor}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function AnimationCard({
  animation,
  icon,
  label,
  textColor,
  primaryColor,
}: {
  animation: IconAnimationType;
  icon: string;
  label: string;
  textColor: string;
  primaryColor: string;
}) {
  const ref = useRef<AnimatedIconHandle>(null);

  return (
    <Pressable style={styles.card} onPress={() => ref.current?.play()}>
      <AnimatedIcon ref={ref} name={icon} animation={animation} size={40} color={primaryColor} />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  hint: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: 120,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});
