import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import Animated from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';
import { AnimatedIcon } from '../src/animated/AnimatedIcon';
import type { AnimatedIconHandle, IconAnimationType } from '../src/animated/AnimatedIcon';
import { SvgKitProvider } from '../src/runtime/SvgKitProvider';
import type { IconRegistry } from '../src/types';

const registry: IconRegistry = {
  check: {
    viewBox: '0 0 24 24',
    multicolor: false,
    tree: [
      {
        tag: 'path',
        props: { d: 'M5 13l4 4L19 7', stroke: 'currentColor', fill: 'none' },
        children: [],
        pathLength: 17.9,
      },
    ],
  },
};

function renderWithProvider(ui: React.ReactElement, theme = {}) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <SvgKitProvider registry={registry} theme={theme}>
        {ui}
      </SvgKitProvider>
    );
  });
  return renderer;
}

describe('<AnimatedIcon/>', () => {
  // autoPlay is always disabled in these tests: the "spin"/"pulse" animations loop forever
  // by default, and Jest runs Reanimated's real (non-mocked) web/JS animation loop under the
  // custom resolver — an uncontrolled infinite loop would hang the test process.
  it.each<IconAnimationType>(['spin', 'pulse', 'color', 'draw'])(
    'renders a known icon without crashing for the "%s" animation',
    (animation) => {
      const renderer = renderWithProvider(
        <AnimatedIcon name="check" animation={animation} autoPlay={false} />
      );
      expect(renderer.root.findByType(Animated.View)).toBeTruthy();
      expect(renderer.root.findByType(Svg)).toBeTruthy();
    }
  );

  it('renders nothing and does not crash for an unknown icon name', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const renderer = renderWithProvider(
      <AnimatedIcon name="does-not-exist" animation="spin" autoPlay={false} />
    );
    expect(renderer.toJSON()).toBeNull();
    warnSpy.mockRestore();
  });

  it('applies a static strokeDasharray matching the precomputed pathLength for "draw"', () => {
    const renderer = renderWithProvider(
      <AnimatedIcon name="check" animation="draw" autoPlay={false} />
    );
    const path = renderer.root.findByType(Path);
    expect(path.props.strokeDasharray).toEqual([17.9, 17.9]);
  });

  it('exposes a play/pause/reset imperative handle', () => {
    const ref = React.createRef<AnimatedIconHandle>();
    renderWithProvider(
      <AnimatedIcon ref={ref} name="check" animation="pulse" autoPlay={false} loop={false} />
    );

    expect(ref.current).not.toBeNull();
    expect(() => {
      act(() => {
        ref.current?.play();
        ref.current?.pause();
        ref.current?.reset();
      });
    }).not.toThrow();
  });

  it('does not require autoPlay to render', () => {
    const renderer = renderWithProvider(
      <AnimatedIcon name="check" animation="spin" autoPlay={false} />
    );
    expect(renderer.root.findByType(Svg)).toBeTruthy();
  });
});
