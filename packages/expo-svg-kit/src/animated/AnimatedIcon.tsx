import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type EasingFunction,
} from 'react-native-reanimated';
import { Svg } from 'react-native-svg';
import { useSvgKitContext } from '../runtime/SvgKitProvider';
import { renderSvgTree } from '../runtime/renderNode';
import { resolveColor } from '../runtime/theme';
import { renderAnimatedDrawTree } from './animatedRenderNode';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export type IconAnimationType = 'spin' | 'pulse' | 'color' | 'draw';

export interface AnimatedIconHandle {
  /** (Re)starts the animation from the beginning. */
  play: () => void;
  /** Freezes the animation at its current position. */
  pause: () => void;
  /** Stops the animation and returns the icon to its resting state. */
  reset: () => void;
}

export interface AnimatedIconProps {
  name: string;
  animation: IconAnimationType;
  size?: number;
  /** A literal color, or a key into the active theme. */
  color?: string;
  strokeWidth?: number;
  /** Override individual layers by their SVG element id. Values accept theme keys too. */
  colors?: Record<string, string>;
  accessibilityLabel?: string;
  /** Length of one animation cycle, in ms. Defaults depend on `animation`. */
  duration?: number;
  /** Repeat forever. Defaults to `true` for `spin`/`pulse`, `false` for `color`/`draw`. */
  loop?: boolean;
  /** Play automatically on mount, and whenever `animation`/`duration`/`loop` change. Defaults to `true`. */
  autoPlay?: boolean;
  /** `pulse` only: the peak scale factor. Defaults to `1.15`. */
  pulseScale?: number;
  /** `color` only: the color to animate toward. Defaults to a built-in accent color. */
  toColor?: string;
}

const DEFAULT_DURATION: Record<IconAnimationType, number> = {
  spin: 1200,
  pulse: 600,
  color: 500,
  draw: 600,
};

const DEFAULT_LOOP: Record<IconAnimationType, boolean> = {
  spin: true,
  pulse: true,
  color: false,
  draw: false,
};

const DEFAULT_TO_COLOR = '#F59E0B';

/** Per-animation (toValue, reverse, easing): kept stable across re-renders via useMemo below,
 * since a fresh Easing function/object identity on every render would otherwise re-trigger
 * the autoplay effect and restart the animation on every unrelated parent re-render. */
function getAnimationShape(animation: IconAnimationType): {
  toValue: number;
  reverse: boolean;
  easing: EasingFunction;
} {
  switch (animation) {
    case 'spin':
      return { toValue: 360, reverse: false, easing: Easing.linear };
    case 'pulse':
      return { toValue: 1, reverse: true, easing: Easing.inOut(Easing.quad) };
    case 'color':
      return { toValue: 1, reverse: true, easing: Easing.inOut(Easing.quad) };
    case 'draw':
      return { toValue: 1, reverse: false, easing: Easing.out(Easing.cubic) };
  }
}

/**
 * Like `<Icon/>`, but plays a Reanimated-powered animation: `spin`, `pulse`, `color`, or
 * `draw` (a reveal animation using the pathLength the CLI/transformer precompute for
 * path/line/polyline/polygon shapes). Requires `react-native-reanimated` (optional peer
 * dependency) and must be used inside an `<SvgKitProvider/>`, like `<Icon/>`.
 */
export const AnimatedIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  function AnimatedIcon(
    {
      name,
      animation,
      size = 24,
      color,
      strokeWidth,
      colors,
      accessibilityLabel,
      duration = DEFAULT_DURATION[animation],
      loop = DEFAULT_LOOP[animation],
      autoPlay = true,
      pulseScale = 1.15,
      toColor,
    },
    ref
  ) {
    const { registry, theme } = useSvgKitContext();
    const definition = registry[name];

    const resolvedColor = resolveColor(color, theme) ?? '#000000';
    const resolvedToColor = resolveColor(toColor, theme) ?? DEFAULT_TO_COLOR;
    const resolvedOverrides = useMemo(() => {
      if (!colors) return undefined;
      const resolved: Record<string, string> = {};
      for (const [id, value] of Object.entries(colors)) {
        const resolvedValue = resolveColor(value, theme);
        if (resolvedValue) resolved[id] = resolvedValue;
      }
      return resolved;
    }, [colors, theme]);

    const { toValue, reverse, easing } = useMemo(() => getAnimationShape(animation), [animation]);
    const progress = useSharedValue(0);

    const play = useCallback(() => {
      progress.value = 0;
      const reps = loop ? -1 : reverse ? 2 : 1;
      progress.value = withRepeat(withTiming(toValue, { duration, easing }), reps, reverse);
    }, [progress, toValue, duration, easing, loop, reverse]);

    const pause = useCallback(() => {
      cancelAnimation(progress);
    }, [progress]);

    const reset = useCallback(() => {
      cancelAnimation(progress);
      progress.value = 0;
    }, [progress]);

    useImperativeHandle(ref, () => ({ play, pause, reset }), [play, pause, reset]);

    useEffect(() => {
      if (!definition) return undefined;
      if (autoPlay) {
        play();
      } else {
        reset();
      }
      return () => cancelAnimation(progress);
    }, [play, reset, autoPlay, progress, definition]);

    const animatedStyle = useAnimatedStyle(() => {
      if (animation === 'spin') {
        return { transform: [{ rotate: `${progress.value}deg` }] };
      }
      if (animation === 'pulse') {
        return { transform: [{ scale: 1 + (pulseScale - 1) * progress.value }] };
      }
      return {};
    });

    const animatedProps = useAnimatedProps<{ color?: string }>(() => {
      if (animation !== 'color') return {};
      return { color: interpolateColor(progress.value, [0, 1], [resolvedColor, resolvedToColor]) };
    });

    if (!definition) {
      if (__DEV__) {
        console.warn(`[expo-svg-kit] Unknown icon name: "${name}".`);
      }
      return null;
    }

    const children =
      animation === 'draw'
        ? renderAnimatedDrawTree(definition.tree, progress, resolvedOverrides)
        : renderSvgTree(definition.tree, resolvedOverrides);

    if (animation === 'color') {
      return (
        <Animated.View style={animatedStyle}>
          <AnimatedSvg
            width={size}
            height={size}
            viewBox={definition.viewBox}
            strokeWidth={strokeWidth}
            accessibilityLabel={accessibilityLabel}
            accessible={Boolean(accessibilityLabel)}
            animatedProps={animatedProps}
          >
            {children}
          </AnimatedSvg>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={animatedStyle}>
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
      </Animated.View>
    );
  }
);
