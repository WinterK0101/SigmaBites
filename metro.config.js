const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs', 'svg');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.unstable_enablePackageExports = false;

config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

module.exports = withNativeWind(config, { input: './app/globals.css' });