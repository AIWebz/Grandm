// Standard Expo metro config - required for the `web` platform to resolve
// react-native core modules through react-native-web correctly.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// getDefaultConfig() only lists ["ios", "android"] by default on SDK 51,
// so platform-suffixed files (e.g. Screen.web.tsx in react-native-screens)
// aren't recognized as the web variant and Metro falls through to the
// native file, which pulls in real react-native internals that don't
// resolve on web (e.g. Libraries/Utilities/Platform has no generic build).
config.resolver.platforms = ["ios", "android", "web"];

module.exports = config;
