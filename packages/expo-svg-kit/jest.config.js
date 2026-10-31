const path = require('node:path');

// require.resolve('svgo') follows the "require" condition, resolving to <svgoRoot>/dist/svgo-node.cjs.
const svgoDistDir = path.dirname(require.resolve('svgo'));

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  rootDir: __dirname,
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  setupFilesAfterEnv: [],
  // svgo's "./browser" export is ESM-only (no "require" condition), which Jest's CJS resolver
  // can't follow directly. Map it to the real file and let babel-jest transpile it, matching
  // how Metro resolves and bundles the same import at runtime.
  moduleNameMapper: {
    '^svgo/browser$': path.join(svgoDistDir, 'svgo.browser.js'),
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|svgo))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};
