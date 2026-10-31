import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Rect, Svg } from 'react-native-svg';
import { Icon } from '../src/runtime/Icon';
import { SvgKitProvider } from '../src/runtime/SvgKitProvider';
import type { IconRegistry } from '../src/types';

const registry: IconRegistry = {
  star: {
    viewBox: '0 0 24 24',
    multicolor: false,
    tree: [{ tag: 'path', props: { d: 'M0 0', fill: 'currentColor' }, children: [] }],
  },
  logo: {
    viewBox: '0 0 32 32',
    multicolor: true,
    tree: [
      {
        tag: 'circle',
        props: { id: 'bg', cx: '16', cy: '16', r: '16', fill: '#123456' },
        children: [],
      },
      {
        tag: 'rect',
        props: { id: 'stripe', x: '4', y: '14', width: '24', height: '4', fill: '#abcdef' },
        children: [],
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

describe('<Icon/>', () => {
  it('resolves a theme key passed as color', () => {
    const renderer = renderWithProvider(<Icon name="star" color="primary" />, {
      primary: '#ff0000',
    });
    const svg = renderer.root.findByType(Svg);
    expect(svg.props.color).toBe('#ff0000');
  });

  it('overrides a layer by id via the colors prop', () => {
    const renderer = renderWithProvider(<Icon name="logo" colors={{ stripe: '#00ff00' }} />);
    const rect = renderer.root.findByType(Rect);
    expect(rect.props.fill).toBe('#00ff00');
  });

  it('renders nothing and does not crash for an unknown icon name', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const renderer = renderWithProvider(<Icon name="does-not-exist" />);
    expect(renderer.toJSON()).toBeNull();
    warnSpy.mockRestore();
  });

  it('exposes accessibilityLabel on the underlying Svg', () => {
    const renderer = renderWithProvider(<Icon name="star" accessibilityLabel="Star icon" />);
    const svg = renderer.root.findByType(Svg);
    expect(svg.props.accessibilityLabel).toBe('Star icon');
    expect(svg.props.accessible).toBe(true);
  });
});
