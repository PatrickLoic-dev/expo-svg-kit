// Reference this from your app's global.d.ts to type `import Logo from './logo.svg'`
// once the Metro transformer is configured:
//
//   /// <reference types="expo-svg-kit/svg-module" />
//
// Deliberately has no top-level import/export: a `<reference types=".."/>`-included .d.ts
// must stay an ambient script (inline `import()` types only) for its `declare module` block
// below to apply globally. A file with top-level imports is treated as its own module instead,
// and its ambient declarations only apply where it is explicitly imported.

declare module '*.svg' {
  export interface SvgComponentProps extends Omit<import('react-native-svg').SvgProps, 'color'> {
    size?: number;
    color?: string;
    /** Override individual layers by their SVG element id, with literal color values. */
    colors?: Record<string, string>;
  }

  const Component: import('react').ComponentType<SvgComponentProps>;
  export default Component;
}
