import path from 'node:path';

const MOCK_UPSTREAM_PATH = path.join(__dirname, '..', '__fixtures__', 'mockUpstreamTransformer.js');

describe('metro svgTransformer', () => {
  const originalEnv = process.env.EXPO_SVG_KIT_UPSTREAM_TRANSFORMER;

  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_SVG_KIT_UPSTREAM_TRANSFORMER = MOCK_UPSTREAM_PATH;
  });

  afterAll(() => {
    process.env.EXPO_SVG_KIT_UPSTREAM_TRANSFORMER = originalEnv;
  });

  it('rewrites .svg files into generated component source before delegating upstream', async () => {
    const { transform } = require('../src/metro/svgTransformer');
    const mockUpstream = require('../__fixtures__/mockUpstreamTransformer.js');
    mockUpstream.__reset();

    await transform({
      filename: 'icon.svg',
      src: '<svg viewBox="0 0 24 24"><path d="M0 0L10 0L10 10Z" fill="red"/></svg>',
      options: {},
    });

    const call = mockUpstream.__getLastCall();
    expect(call.filename).toBe('icon.svg');
    expect(call.src).toContain('export default function SvgComponent');
    expect(call.src).toContain('"viewBox":"0 0 24 24"');
  });

  it('passes non-.svg files through untouched', async () => {
    const { transform } = require('../src/metro/svgTransformer');
    const mockUpstream = require('../__fixtures__/mockUpstreamTransformer.js');
    mockUpstream.__reset();

    const originalSrc = 'export default function App() { return null; }';
    await transform({ filename: 'App.tsx', src: originalSrc, options: {} });

    const call = mockUpstream.__getLastCall();
    expect(call.src).toBe(originalSrc);
  });

  it('delegates getCacheKey to the upstream transformer', () => {
    const { getCacheKey } = require('../src/metro/svgTransformer');
    expect(getCacheKey({})).toBe('mock-cache-key');
  });
});
