import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/lib/**', '**/dist/**', '**/node_modules/**', '**/.expo/**', '**/web-build/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: [
      '**/*.config.js',
      '**/babel.config.js',
      '**/metro.config.js',
      '**/jest.config.js',
      '**/bin/*.js',
      '**/scripts/*.js',
      '**/__fixtures__/**/*.js',
      '**/__mocks__/**/*.js',
    ],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
);
