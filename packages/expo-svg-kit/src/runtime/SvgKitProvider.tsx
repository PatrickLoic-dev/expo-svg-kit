import React, { createContext, useContext, useMemo } from 'react';
import type { IconRegistry, SvgKitTheme } from '../types';

export interface SvgKitContextValue {
  registry: IconRegistry;
  theme: SvgKitTheme;
}

const SvgKitContext = createContext<SvgKitContextValue | null>(null);

export interface SvgKitProviderProps {
  registry: IconRegistry;
  theme?: SvgKitTheme;
  children: React.ReactNode;
}

/** Makes an icon registry and a color theme available to every <Icon/> below it. */
export function SvgKitProvider({
  registry,
  theme = {},
  children,
}: SvgKitProviderProps): React.JSX.Element {
  const value = useMemo(() => ({ registry, theme }), [registry, theme]);
  return <SvgKitContext.Provider value={value}>{children}</SvgKitContext.Provider>;
}

export function useSvgKitContext(): SvgKitContextValue {
  const context = useContext(SvgKitContext);
  if (!context) {
    throw new Error('useSvgKitContext must be used within an <SvgKitProvider>.');
  }
  return context;
}
