import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
  },
  pinBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentPreview: {
    color: '#8E8D94',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorText: {
    color: '#8E8D94',
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
  },
  timeText: {
    color: '#8E8D94',
    fontSize: 11,
  },
});
