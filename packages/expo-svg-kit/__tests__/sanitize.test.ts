import { parse } from 'svgson';
import { sanitizeSvgTree } from '../src/cli/sanitize';

describe('sanitizeSvgTree', () => {
  it('removes <script> tags, on* attributes and external href references', async () => {
    const parsed = await parse(`
      <svg viewBox="0 0 24 24">
        <script>alert('xss')</script>
        <path d="M0 0h24v24H0z" fill="#000" onclick="alert(1)" />
        <image href="https://evil.example.com/pixel.png" />
      </svg>
    `);

    const sanitized = sanitizeSvgTree(parsed);
    const tags = sanitized.children.map((child) => child.name);

    expect(tags).not.toContain('script');
    expect(tags).toContain('path');
    expect(tags).toContain('image');

    const path = sanitized.children.find((child) => child.name === 'path');
    expect(path?.attributes.onclick).toBeUndefined();

    const image = sanitized.children.find((child) => child.name === 'image');
    expect(image?.attributes.href).toBeUndefined();
  });
});
