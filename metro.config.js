/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions if needed
config.resolver.sourceExts.push('cjs');

// Ensure proper handling of node modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add asset extensions
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'yaml', 'yml');

// Configure transformer for SDK 54 with code splitting optimization
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
  // Optimize for code splitting and lazy loading
  compress: {
    drop_console: false, // Keep console logs for debugging
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info'],
    // Enable dead code elimination for better tree shaking
    dead_code: true,
    // Optimize for Hermes engine
    ecma: 8,
  },
};

// Enable code splitting and lazy loading optimizations
config.transformer.enableBabelRCLookup = false;

// Optimize chunk splitting for better lazy loading performance
config.serializer = {
  ...config.serializer,
  // Enable better chunk splitting
  createModuleIdFactory: () => (path) => {
    // Create consistent module IDs for better caching
    return path.replace(__dirname, '').replace(/\\/g, '/');
  },
};

// Enable symlinks for Bun compatibility
config.resolver.unstable_enableSymlinks = true;

// Fix source map issues
config.symbolicator = {
  customizeFrame: (frame) => {
    if (frame.file && frame.file.includes('<anonymous>')) {
      return null; // Skip anonymous frames
    }
    return frame;
  },
};

// Disable source maps in development to avoid path issues
config.transformer.enableBabelRCLookup = false;

module.exports = config;
