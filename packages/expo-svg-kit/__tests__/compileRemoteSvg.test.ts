import { compileRemoteSvg } from '../src/runtime/compileRemoteSvg';

describe('compileRemoteSvg', () => {
  it('compiles raw SVG markup into an IconDefinition, applying currentColor theming', async () => {
    const definition = await compileRemoteSvg(
      '<svg viewBox="0 0 24 24"><path d="M0 0L10 0L10 10Z" fill="red"/></svg>',
      false
    );
    expect(definition.viewBox).toBe('0 0 24 24');
    expect(definition.tree[0].props.fill).toBe('currentColor');
  });

  it('preserves literal colors when multicolor is true', async () => {
    const definition = await compileRemoteSvg(
      '<svg viewBox="0 0 32 32"><circle id="bg" cx="16" cy="16" r="16" fill="#4F46E5"/></svg>',
      true
    );
    expect(definition.multicolor).toBe(true);
    expect(definition.tree[0].props.fill).toBe('#4f46e5');
  });

  it('sanitizes dangerous content', async () => {
    const definition = await compileRemoteSvg(
      '<svg viewBox="0 0 24 24"><script>alert(1)</script><path d="M0 0L10 0L10 10Z" fill="red" onclick="alert(1)"/></svg>',
      false
    );
    const tags = definition.tree.map((node) => node.tag);
    expect(tags).not.toContain('script');
    expect(definition.tree.find((node) => node.tag === 'path')?.props.onclick).toBeUndefined();
  });
});
