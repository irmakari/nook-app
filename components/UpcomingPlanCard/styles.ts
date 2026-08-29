import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 13,
    color: '#8E8D94',
    fontFamily: 'Poppins_500Medium',
  },
  footerDivider: {
    height: 1,
    width: '100%',
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendanceText: {
    fontSize: 12,
    color: '#71717A',
    fontFamily: 'Poppins_500Medium',
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  emptySubtitle: {
    color: '#8E8D94',
    fontSize: 13,
    marginBottom: 14,
  },
  addPlanBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addPlanText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
});
