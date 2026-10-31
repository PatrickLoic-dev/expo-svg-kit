import { computePathLength } from '../src/cli/pathLength';

describe('computePathLength', () => {
  it('computes a path length', () => {
    expect(computePathLength('path', { d: 'M0 0 L10 0' })).toBeCloseTo(10);
  });

  it('computes a line length', () => {
    expect(computePathLength('line', { x1: '0', y1: '0', x2: '0', y2: '5' })).toBeCloseTo(5);
  });

  it('handles comma-separated polyline points', () => {
    const length = computePathLength('polyline', { points: '0,0 10,0 10,10' });
    expect(length).toBeCloseTo(20);
  });

  it('handles space-separated polygon points and closes the shape', () => {
    const length = computePathLength('polygon', { points: '0 0 10 0 10 10 0 10' });
    expect(length).toBeCloseTo(40);
  });

  it('handles points with commas and no spaces', () => {
    const length = computePathLength('polyline', { points: '0,0,10,0,10,10' });
    expect(length).toBeCloseTo(20);
  });

  it('returns undefined for unsupported tags or missing geometry', () => {
    expect(computePathLength('circle', { r: '5' })).toBeUndefined();
    expect(computePathLength('polyline', { points: '' })).toBeUndefined();
    expect(computePathLength('polyline', { points: '0,0,10' })).toBeUndefined();
  });
});
