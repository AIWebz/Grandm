/**
 * Web build of nativeAds.ts. AdMob has no browser SDK, so this never even
 * requires react-native-google-mobile-ads - importing it at all would pull
 * in real react-native internals that don't resolve on web. Callers already
 * treat a null return as "ads unavailable, show the placeholder".
 */
export function getMobileAdsModule(): null {
  return null;
}
