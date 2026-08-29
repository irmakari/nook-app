import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  leftIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
  },
  timeSpaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  spaceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  spaceName: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  actorSubText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8D94',
    marginTop: 1,
  },
  rightChevron: {
    marginLeft: 8,
  },
});
