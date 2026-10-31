import { compileSvgToComponentSource } from '../src/metro/compileSvgToComponentSource';

describe('compileSvgToComponentSource', () => {
  it('generates a default-exported component using renderSvgTree and the icon viewBox', () => {
    const source = compileSvgToComponentSource(
      '<svg viewBox="0 0 24 24"><path d="M0 0L10 0L10 10Z" fill="red"/></svg>',
      'logo.svg'
    );

    expect(source).toContain("import { renderSvgTree } from 'expo-svg-kit'");
    expect(source).toContain('export default function SvgComponent');
    expect(source).toContain('"viewBox":"0 0 24 24"');
  });

  it('replaces fixed colors with currentColor unless the file is marked .multicolor', () => {
    const regular = compileSvgToComponentSource(
      '<svg viewBox="0 0 24 24"><path d="M0 0L10 0L10 10Z" fill="red"/></svg>',
      'logo.svg'
    );
    expect(regular).toContain('"fill":"currentColor"');

    const multicolor = compileSvgToComponentSource(
      '<svg viewBox="0 0 24 24"><path d="M0 0L10 0L10 10Z" fill="red"/></svg>',
      'brand.multicolor.svg'
    );
    expect(multicolor).toContain('"fill":"red"');
  });

  it('sanitizes dangerous content before embedding it in the generated source', () => {
    const source = compileSvgToComponentSource(
      '<svg viewBox="0 0 24 24"><script>alert(1)</script><path d="M0 0L10 0L10 10Z" fill="red" onclick="alert(1)"/></svg>',
      'logo.svg'
    );
    expect(source).not.toContain('script');
    expect(source).not.toContain('onclick');
  });
});
