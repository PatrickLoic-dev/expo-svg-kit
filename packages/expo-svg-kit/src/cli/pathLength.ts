import { svgPathProperties } from 'svg-path-properties';

const LENGTH_CAPABLE_TAGS = new Set(['path', 'line', 'polyline', 'polygon']);

function shapeToPathD(tag: string, attributes: Record<string, string>): string | null {
  if (tag === 'path') return attributes.d ?? null;
  if (tag === 'line') {
    const { x1 = '0', y1 = '0', x2 = '0', y2 = '0' } = attributes;
    return `M${x1},${y1} L${x2},${y2}`;
  }
  if (tag === 'polyline' || tag === 'polygon') {
    // `points` coordinates may be separated by whitespace, commas, or both (e.g. "10,10 20,20").
    const numbers = (attributes.points ?? '')
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);
    if (numbers.length < 2 || numbers.length % 2 !== 0) return null;
    const coords: string[] = [];
    for (let i = 0; i < numbers.length; i += 2) {
      coords.push(`${numbers[i]},${numbers[i + 1]}`);
    }
    const close = tag === 'polygon' ? ' Z' : '';
    return `M${coords.join(' L ')}${close}`;
  }
  return null;
}

/** Computes the total length of a shape's outline, when supported, for future draw animations. */
export function computePathLength(
  tag: string,
  attributes: Record<string, string>
): number | undefined {
  if (!LENGTH_CAPABLE_TAGS.has(tag)) return undefined;
  const d = shapeToPathD(tag, attributes);
  if (!d) return undefined;
  try {
    return new svgPathProperties(d).getTotalLength();
  } catch {
    return undefined;
  }
}
