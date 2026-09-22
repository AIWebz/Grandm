/**
 * react-native-google-mobile-ads is a native module - it needs a custom
 * dev client / EAS build (not Expo Go) to load. This central require
 * keeps every ad call site safe to import even where the native module
 * isn't present, degrading to "ads unavailable" instead of crashing.
 */
export function getMobileAdsModule(): typeof import("react-native-google-mobile-ads") | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-native-google-mobile-ads");
  } catch {
    return null;
  }
}
