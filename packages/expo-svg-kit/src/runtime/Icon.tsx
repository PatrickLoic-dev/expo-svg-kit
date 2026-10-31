import React, { useMemo } from 'react';
import { Svg } from 'react-native-svg';
import { useSvgKitContext } from './SvgKitProvider';
import { renderSvgNode } from './renderNode';
import { resolveColor } from './theme';

export interface IconProps {
  name: string;
  size?: number;
  /** A literal color, or a key into the active theme. */
  color?: string;
  strokeWidth?: number;
  /** Override individual layers by their SVG element id. Values accept theme keys too. */
  colors?: Record<string, string>;
  accessibilityLabel?: string;
}

/** Renders a named icon from the active SvgKitProvider registry. */
export const Icon = React.memo(function Icon({
  name,
  size = 24,
  color,
  strokeWidth,
  colors,
  accessibilityLabel,
}: IconProps): React.JSX.Element | null {
  const { registry, theme } = useSvgKitContext();
  const definition = registry[name];

  const resolvedColor = resolveColor(color, theme);
  const resolvedOverrides = useMemo(() => {
    if (!colors) return undefined;
    const resolved: Record<string, string> = {};
    for (const [id, value] of Object.entries(colors)) {
      const resolvedValue = resolveColor(value, theme);
      if (resolvedValue) resolved[id] = resolvedValue;
    }
    return resolved;
  }, [colors, theme]);

  if (!definition) {
    if (__DEV__) {
      console.warn(`[expo-svg-kit] Unknown icon name: "${name}".`);
    }
    return null;
  }

  const children = definition.tree.map((node, index) =>
    renderSvgNode(node, index, resolvedOverrides)
  );

  return (
    <Svg
      width={size}
      height={size}
      viewBox={definition.viewBox}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      accessibilityLabel={accessibilityLabel}
      accessible={Boolean(accessibilityLabel)}
    >
      {children}
    </Svg>
  );
});
