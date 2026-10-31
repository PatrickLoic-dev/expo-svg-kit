import { svgPathProperties } from 'svg-path-properties';

const LENGTH_CAPABLE_TAGS = new Set(['path', 'line', 'polyline', 'polygon']);

function shapeToPathD(tag: string, attributes: Record<string, string>): string | null {
  if (tag === 'path') return attributes.d ?? null;
  if (tag === 'line') {
    const { x1 = '0', y1 = '0', x2 = '0', y2 = '0' } = attributes;
    return `M${x1},${y1} L${x2},${y2}`;
  }
  if (tag === 'polyline' || tag === 'polygon') {
    const points = (attributes.points ?? '').trim();
    if (!points) return null;
    const close = tag === 'polygon' ? ' Z' : '';
    return `M${points.replace(/\s+/g, ' L ')}${close}`;
  }
  return null;
}

/** Computes the total length of a shape's outline, when supported, for future draw animations. */
export function computePathLength(tag: string, attributes: Record<string, string>): number | undefined {
  if (!LENGTH_CAPABLE_TAGS.has(tag)) return undefined;
  const d = shapeToPathD(tag, attributes);
  if (!d) return undefined;
  try {
    return new svgPathProperties(d).getTotalLength();
  } catch {
    return undefined;
  }
}
