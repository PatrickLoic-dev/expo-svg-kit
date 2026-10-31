/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  rootDir: __dirname,
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  setupFilesAfterEnv: [],
};
