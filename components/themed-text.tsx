import { StyleSheet, Text, type TextProps } from 'react-native';

import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'hero'
    | 'title'
    | 'subtitle'
    | 'section'
    | 'cardTitle'
    | 'body'
    | 'default'
    | 'defaultSemiBold'
    | 'label'
    | 'caption'
    | 'muted'
    | 'link';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'body',
  weight,
  ...rest
}: ThemedTextProps) {
  const defaultTextColor = type === 'muted' || type === 'caption' ? 'textSecondary' : 'text';
  const color = useThemeColor({ light: lightColor, dark: darkColor }, defaultTextColor as 'text');

  const resolvedType =
    type === 'default' ? 'body' : type === 'defaultSemiBold' ? 'defaultSemiBold' : type;

  return (
    <Text
      style={[
        { color },
        styles.base,
        styles[resolvedType as keyof typeof styles],
        weight && { fontFamily: Typography.fontFamily[weight] },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fontFamily.regular,
    letterSpacing: -0.2,
  },
  hero: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  section: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.semiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 22,
  },
  defaultSemiBold: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 16,
    letterSpacing: 0,
  },
  muted: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 18,
  },
  link: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
});
