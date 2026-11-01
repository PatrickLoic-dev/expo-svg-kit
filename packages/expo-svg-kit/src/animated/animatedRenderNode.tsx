import React from 'react';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { Line, Path, Polygon, Polyline } from 'react-native-svg';
import { renderSvgNode, toProps } from '../runtime/renderNode';
import type { SvgNode } from '../types';

// Only the shapes the CLI/transformer precompute a pathLength for (see src/cli/pathLength.ts)
// can be "drawn" by animating strokeDashoffset.
const DRAWABLE_COMPONENTS: Record<string, React.ElementType> = {
  path: Animated.createAnimatedComponent(Path),
  line: Animated.createAnimatedComponent(Line),
  polyline: Animated.createAnimatedComponent(Polyline),
  polygon: Animated.createAnimatedComponent(Polygon),
};

interface AnimatedDrawableShapeProps {
  node: SvgNode;
  progress: SharedValue<number>;
  colorOverrides: Record<string, string> | undefined;
}

function AnimatedDrawableShape({
  node,
  progress,
  colorOverrides,
}: AnimatedDrawableShapeProps): React.ReactElement | null {
  const length = node.pathLength ?? 0;
  const Component = DRAWABLE_COMPONENTS[node.tag.toLowerCase()];
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length - progress.value * length,
  }));

  if (!Component) return null;

  return (
    <Component
      {...toProps(node, colorOverrides)}
      strokeDasharray={[length, length]}
      animatedProps={animatedProps}
    />
  );
}

/**
 * Like renderSvgNode, but shapes with a precomputed pathLength (path/line/polyline/polygon)
 * are reveal-drawn via an animated strokeDashoffset driven by `progress` (0 = hidden,
 * 1 = fully drawn). Shapes without a pathLength render exactly like the static renderer.
 */
export function renderAnimatedDrawNode(
  node: SvgNode,
  key: string | number,
  progress: SharedValue<number>,
  colorOverrides?: Record<string, string>
): React.ReactNode {
  if (node.pathLength !== undefined && DRAWABLE_COMPONENTS[node.tag.toLowerCase()]) {
    return (
      <AnimatedDrawableShape
        key={key}
        node={node}
        progress={progress}
        colorOverrides={colorOverrides}
      />
    );
  }
  return renderSvgNode(node, key, colorOverrides);
}

/** Renders a top-level list of SvgNode siblings (an IconDefinition's `tree`) with the draw animation. */
export function renderAnimatedDrawTree(
  nodes: SvgNode[],
  progress: SharedValue<number>,
  colorOverrides?: Record<string, string>
): React.ReactNode {
  return nodes.map((node, index) => renderAnimatedDrawNode(node, index, progress, colorOverrides));
}
