import type { Config as SvgoConfig } from 'svgo';

// Typed loosely: svgo's PluginConfig union doesn't model passing `params` to a builtin preset by name.
export const DEFAULT_SVGO_CONFIG = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Element ids are load-bearing: <Icon colors={{ [id]: ... }}/> overrides layers by id.
          cleanupIds: false,
        },
      },
    },
    // removeViewBox lives outside preset-default in svgo 4; disable it explicitly instead.
    { name: 'removeViewBox', active: false },
  ],
} as unknown as SvgoConfig;
