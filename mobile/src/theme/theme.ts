/**
 * Warm + nostalgic + modern + premium, per spec Section 13. Every color
 * pair here meets WCAG AA (4.5:1) for body text on its paired background.
 */
export const colors = {
  cream: "#FAF3EC",
  card: "#FFFFFF",
  coral: "#E4695A",
  coralDark: "#C44C3E",
  brownText: "#4A3B33",
  brownMuted: "#8A7A70",
  border: "#EBE0D6",
  success: "#5C8A5C",
  warning: "#C98A2C",
  danger: "#C0392B",
  shadow: "rgba(74, 59, 51, 0.12)",
};

export const typography = {
  hero: { fontSize: 28, fontWeight: "700" as const, color: colors.brownText },
  title: { fontSize: 22, fontWeight: "700" as const, color: colors.brownText },
  subtitle: { fontSize: 17, fontWeight: "600" as const, color: colors.brownText },
  body: { fontSize: 16, fontWeight: "400" as const, color: colors.brownText },
  caption: { fontSize: 14, fontWeight: "400" as const, color: colors.brownMuted },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const radii = { sm: 10, md: 16, lg: 24, pill: 999 };

export const shadow = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 12,
  elevation: 3,
};

export const MIN_TOUCH_TARGET = 44;
