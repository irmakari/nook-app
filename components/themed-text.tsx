import { StyleSheet, Text, type TextProps } from 'react-native';

import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type TextVariant =
  | 'display'
  | 'screenTitle'
  | 'title'
  | 'subtitle'
  | 'cardTitle'
  | 'body'
  | 'description'
  | 'label'
  | 'caption'
  | 'metadata'
  | 'button'
  | 'link'
  // Legacy aliases kept while the remaining components are migrated.
  | 'hero'
  | 'section'
  | 'muted'
  | 'default'
  | 'defaultSemiBold';

export type TextTone = 'primary' | 'secondary' | 'muted';
export type TextWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TextVariant;
  tone?: TextTone;
  weight?: TextWeight;
};

const TYPE_ALIASES = {
  hero: 'display',
  section: 'label',
  muted: 'description',
  default: 'body',
  defaultSemiBold: 'body',
} as const;

const DEFAULT_TONES: Partial<Record<TextVariant, TextTone>> = {
  description: 'secondary',
  label: 'secondary',
  caption: 'secondary',
  metadata: 'muted',
  muted: 'secondary',
  section: 'secondary',
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'body',
  tone,
  weight,
  ...rest
}: ThemedTextProps) {
  const resolvedType = TYPE_ALIASES[type as keyof typeof TYPE_ALIASES] ?? type;
  const resolvedTone = tone ?? DEFAULT_TONES[type] ?? DEFAULT_TONES[resolvedType] ?? 'primary';
  const colorName =
    resolvedTone === 'primary'
      ? 'text'
      : resolvedTone === 'secondary'
        ? 'textSecondary'
        : 'textMuted';
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorName);
  const resolvedWeight =
    weight ?? (type === 'defaultSemiBold' ? 'semiBold' : undefined);

  return (
    <Text
      style={[
        { color },
        styles.base,
        styles[resolvedType as keyof typeof styles],
        resolvedWeight && { fontFamily: Typography.fontFamily[resolvedWeight] },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fontFamily.regular,
    letterSpacing: 0,
  },
  display: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 38,
    letterSpacing: 0,
  },
  screenTitle: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 32,
    letterSpacing: 0,
  },
  title: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 28,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 24,
    letterSpacing: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 16,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 16,
    letterSpacing: 0,
  },
  metadata: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 16,
  },
  button: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 20,
  },
  link: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
});
