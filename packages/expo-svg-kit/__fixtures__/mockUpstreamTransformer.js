// Fake "@expo/metro-config/babel-transformer" stand-in, used by svgTransformer.test.ts to
// observe what source gets handed off instead of invoking a real Babel transform.
let lastCall = null;

module.exports.transform = (args) => {
  lastCall = args;
  return { ast: { type: 'File' }, metadata: {} };
};

module.exports.getCacheKey = () => 'mock-cache-key';

module.exports.__getLastCall = () => lastCall;
module.exports.__reset = () => {
  lastCall = null;
};
