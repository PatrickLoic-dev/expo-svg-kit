import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SvgKitProvider } from 'expo-svg-kit';
import { registry } from './svg-registry';
import { GalleryScreen } from './screens/GalleryScreen';
import { PropsDemoScreen } from './screens/PropsDemoScreen';

const THEMES = {
  light: { background: '#FFFFFF', text: '#111827', primary: '#4F46E5', danger: '#DC2626' },
  dark: { background: '#0F172A', text: '#F8FAFC', primary: '#818CF8', danger: '#F87171' },
};

type Screen = 'gallery' | 'props';

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('gallery');
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');
  const theme = THEMES[scheme];

  return (
    <SvgKitProvider registry={registry} theme={theme}>
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.tabs}>
          <TabButton
            label="Gallery"
            active={screen === 'gallery'}
            onPress={() => setScreen('gallery')}
            theme={theme}
          />
          <TabButton
            label="Props demo"
            active={screen === 'props'}
            onPress={() => setScreen('props')}
            theme={theme}
          />
          <Pressable
            onPress={() => setScheme((s) => (s === 'light' ? 'dark' : 'light'))}
            style={styles.themeToggle}
          >
            <Text style={{ color: theme.text }}>
              {scheme === 'light' ? 'Dark mode' : 'Light mode'}
            </Text>
          </Pressable>
        </View>
        {screen === 'gallery' ? (
          <GalleryScreen textColor={theme.text} />
        ) : (
          <PropsDemoScreen textColor={theme.text} />
        )}
      </SafeAreaView>
    </SvgKitProvider>
  );
}

function TabButton({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: { primary: string; text: string };
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Text
        style={{ color: active ? theme.primary : theme.text, fontWeight: active ? '700' : '400' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tabButton: {
    paddingVertical: 4,
  },
  themeToggle: {
    marginLeft: 'auto',
  },
});
