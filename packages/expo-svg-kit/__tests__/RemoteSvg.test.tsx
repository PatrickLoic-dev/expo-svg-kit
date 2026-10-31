import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Svg } from 'react-native-svg';
import { RemoteSvg } from '../src/runtime/RemoteSvg';
import { SvgKitProvider } from '../src/runtime/SvgKitProvider';

jest.mock('expo-file-system');

const mockFs = require('expo-file-system');

const STAR_SVG = '<svg viewBox="0 0 24 24"><path d="M0 0L10 0L10 10Z" fill="red"/></svg>';

async function renderAndWait(ui: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(ui);
    await Promise.resolve();
    await Promise.resolve();
  });
  return renderer;
}

describe('<RemoteSvg/>', () => {
  beforeEach(() => {
    mockFs.__reset();
  });

  it('downloads, caches, and renders the SVG from the given uri', async () => {
    mockFs.__setRemoteContent('https://example.com/star.svg', STAR_SVG);

    const renderer = await renderAndWait(<RemoteSvg uri="https://example.com/star.svg" />);

    const svg = renderer.root.findByType(Svg);
    expect(svg.props.viewBox).toBe('0 0 24 24');
    expect(mockFs.__getDownloadCount()).toBe(1);
  });

  it('reuses the cached file on a second render with the same uri (no re-download)', async () => {
    mockFs.__setRemoteContent('https://example.com/star.svg', STAR_SVG);

    await renderAndWait(<RemoteSvg uri="https://example.com/star.svg" />);
    expect(mockFs.__getDownloadCount()).toBe(1);

    await renderAndWait(<RemoteSvg uri="https://example.com/star.svg" />);
    expect(mockFs.__getDownloadCount()).toBe(1);
  });

  it('re-downloads when forceRefresh is set', async () => {
    mockFs.__setRemoteContent('https://example.com/star.svg', STAR_SVG);

    await renderAndWait(<RemoteSvg uri="https://example.com/star.svg" />);
    await renderAndWait(<RemoteSvg uri="https://example.com/star.svg" forceRefresh />);

    expect(mockFs.__getDownloadCount()).toBe(2);
  });

  it('calls onError and renders the fallback when the download fails', async () => {
    const onError = jest.fn();

    const renderer = await renderAndWait(
      <RemoteSvg uri="https://example.com/missing.svg" onError={onError} fallback={null} />
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(renderer.root.findAllByType(Svg)).toHaveLength(0);
  });

  it('resolves color from the active SvgKitProvider theme', async () => {
    mockFs.__setRemoteContent('https://example.com/star.svg', STAR_SVG);

    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        <SvgKitProvider registry={{}} theme={{ primary: '#ff0000' }}>
          <RemoteSvg uri="https://example.com/star.svg" color="primary" />
        </SvgKitProvider>
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const svg = renderer.root.findByType(Svg);
    expect(svg.props.color).toBe('#ff0000');
  });
});
