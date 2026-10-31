import { fileNameToIconName } from '../src/cli/kebabCase';

describe('fileNameToIconName', () => {
  it('converts PascalCase and spaces to kebab-case', () => {
    expect(fileNameToIconName('ArrowRight.svg')).toEqual({ name: 'arrow-right', multicolor: false });
    expect(fileNameToIconName('arrow right.svg')).toEqual({ name: 'arrow-right', multicolor: false });
  });

  it('detects the .multicolor suffix and strips it from the name', () => {
    expect(fileNameToIconName('Brand-Logo.multicolor.svg')).toEqual({
      name: 'brand-logo',
      multicolor: true,
    });
  });
});
