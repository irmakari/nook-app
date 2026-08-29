import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 4,
  },
  leftGroup: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleBlock: {
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 2,
    color: '#8E8D94',
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    marginLeft: 8,
  },
});
