import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  timeTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  votersGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  votesCountText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
  },
  finalizeLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  finalizeLinkText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
});
