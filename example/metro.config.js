const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Let Metro see the package source in packages/expo-svg-kit (npm workspaces, no npm link).
config.watchFolders = [path.resolve(workspaceRoot, 'packages', 'expo-svg-kit')];

// Resolve modules from both the example app and the workspace root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
