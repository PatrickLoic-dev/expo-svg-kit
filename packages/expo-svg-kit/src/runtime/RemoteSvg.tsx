import React, { useEffect, useState } from 'react';
import { Svg } from 'react-native-svg';
import { compileRemoteSvg } from './compileRemoteSvg';
import { fnv1aHash } from './hash';
import { renderSvgTree } from './renderNode';
import { useOptionalSvgKitContext } from './SvgKitProvider';
import { resolveColor } from './theme';
import type { IconDefinition } from '../types';

export interface RemoteSvgProps {
  /** URL of the SVG to fetch. */
  uri: string;
  size?: number;
  /** A literal color, or (inside an <SvgKitProvider/>) a key into the active theme. */
  color?: string;
  strokeWidth?: number;
  /** Override individual layers by their SVG element id. Values accept theme keys too. */
  colors?: Record<string, string>;
  /** Skip the currentColor theming pass, for multicolor assets (logos, illustrations). */
  multicolor?: boolean;
  accessibilityLabel?: string;
  /** Re-download even if a cached copy already exists. */
  forceRefresh?: boolean;
  /** Rendered while the SVG is being downloaded/compiled. */
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Lazily requires expo-file-system, so this module can still be imported (and <Icon/> keep
 * working) in apps that don't have that peer dependency installed, as long as <RemoteSvg/> is
 * never actually rendered.
 */
function loadFileSystem(): typeof import('expo-file-system') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional peer dependency
  return require('expo-file-system');
}

async function readOrDownload(uri: string, forceRefresh: boolean | undefined): Promise<string> {
  const { Directory, File, Paths } = loadFileSystem();
  const cacheDir = new Directory(Paths.cache, 'expo-svg-kit');
  if (!cacheDir.exists) cacheDir.create({ intermediates: true });

  const cacheFile = new File(cacheDir, `${fnv1aHash(uri)}.svg`);

  if (!forceRefresh && cacheFile.exists) {
    return cacheFile.text();
  }

  if (cacheFile.exists) cacheFile.delete();
  await File.downloadFileAsync(uri, cacheFile);
  return cacheFile.text();
}

/** Fetches, caches (via expo-file-system), and renders an SVG from a URL. */
export function RemoteSvg({
  uri,
  size = 24,
  color,
  strokeWidth,
  colors,
  multicolor = false,
  accessibilityLabel,
  forceRefresh,
  fallback = null,
  onError,
}: RemoteSvgProps): React.JSX.Element | null {
  const context = useOptionalSvgKitContext();
  const theme = context?.theme ?? {};
  const [definition, setDefinition] = useState<IconDefinition | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDefinition(null);

    (async () => {
      try {
        const raw = await readOrDownload(uri, forceRefresh);
        const compiled = await compileRemoteSvg(raw, multicolor);
        if (!cancelled) setDefinition(compiled);
      } catch (error) {
        if (!cancelled) onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uri, forceRefresh, multicolor, onError]);

  if (!definition) return <>{fallback}</>;

  const resolvedColor = resolveColor(color, theme);
  const resolvedOverrides = colors
    ? Object.fromEntries(
        Object.entries(colors)
          .map(([id, value]) => [id, resolveColor(value, theme)])
          .filter((entry): entry is [string, string] => Boolean(entry[1]))
      )
    : undefined;

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
      {renderSvgTree(definition.tree, resolvedOverrides)}
    </Svg>
  );
}
