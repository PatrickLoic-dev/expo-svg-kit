/** Derives a kebab-case icon name from an SVG filename, stripping the `.multicolor` suffix. */
export function fileNameToIconName(fileName: string): { name: string; multicolor: boolean } {
  const withoutExt = fileName.replace(/\.svg$/i, '');
  const multicolor = /\.multicolor$/i.test(withoutExt);
  const base = withoutExt.replace(/\.multicolor$/i, '');

  const name = base
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return { name, multicolor };
}
