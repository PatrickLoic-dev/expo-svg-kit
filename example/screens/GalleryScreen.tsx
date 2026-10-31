import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'expo-svg-kit';
import { registry, type IconName } from '../svg-registry';

export interface GalleryScreenProps {
  textColor: string;
}

const iconNames = Object.keys(registry) as IconName[];

export function GalleryScreen({ textColor }: GalleryScreenProps): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {iconNames.map((name) => (
        <View key={name} style={styles.cell}>
          <Icon name={name} size={32} color={textColor} />
          <Text style={[styles.label, { color: textColor }]}>{name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  cell: {
    width: 88,
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
});
