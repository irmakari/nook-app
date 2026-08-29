import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  content: {
    flex: 1,
  },
  headerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actorName: {
    fontFamily: 'Poppins_600SemiBold',
  },
  actionText: {
    fontFamily: 'Poppins_400Regular',
    color: '#8E8D94',
  },
  targetTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 2,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spaceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  spaceName: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  timeText: {
    fontSize: 12,
    color: '#8E8D94',
  },
});
