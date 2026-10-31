import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'expo-svg-kit';
// v0.2: direct import via the Metro transformer, no svg-kit generate / registry needed.
import DirectTrash from '../assets/svg/trash.svg';

const SIZES = [16, 24, 32, 48];
const COLOR_OPTIONS = ['primary', 'danger', 'currentColor-demo'] as const;

export interface PropsDemoScreenProps {
  textColor: string;
}

export function PropsDemoScreen({ textColor }: PropsDemoScreenProps): React.JSX.Element {
  const [colorIndex, setColorIndex] = useState(0);
  const selectedColor =
    COLOR_OPTIONS[colorIndex] === 'currentColor-demo' ? textColor : COLOR_OPTIONS[colorIndex];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.section, { color: textColor }]}>Sizes</Text>
      <View style={styles.row}>
        {SIZES.map((size) => (
          <Icon key={size} name="star" size={size} color={textColor} />
        ))}
      </View>

      <Text style={[styles.section, { color: textColor }]}>Theme colors (tap to cycle)</Text>
      <View
        style={styles.row}
        onTouchEnd={() => setColorIndex((index) => (index + 1) % COLOR_OPTIONS.length)}
      >
        <Icon name="heart" size={40} color={selectedColor} />
        <Text style={{ color: textColor }}>{COLOR_OPTIONS[colorIndex]}</Text>
      </View>

      <Text style={[styles.section, { color: textColor }]}>Layer override via colors prop</Text>
      <View style={styles.row}>
        <Icon name="brand-logo" size={56} />
        <Icon name="brand-logo" size={56} colors={{ bg: '#16A34A' }} />
      </View>

      <Text style={[styles.section, { color: textColor }]}>
        Direct import via the Metro transformer (v0.2, no registry)
      </Text>
      <View style={styles.row}>
        <DirectTrash size={32} color={textColor} />
        <Text style={{ color: textColor }}>import DirectTrash from '../assets/svg/trash.svg'</Text>
      </View>

      <Text style={[styles.section, { color: textColor }]}>
        Unknown icon name (dev warning, renders nothing)
      </Text>
      <View style={styles.row}>
        <Icon name="totally-unknown-icon" size={32} color={textColor} />
        <Text style={{ color: textColor }}>(nothing rendered here)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  section: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
