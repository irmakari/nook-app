import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  headerRow: {
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: -0.1,
  },
});
