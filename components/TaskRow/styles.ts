import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    lineHeight: 21,
  },
  completedTitle: {
    color: '#8E8D94',
    textDecorationLine: 'line-through',
  },
  note: {
    color: '#8E8D94',
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#8E8D94',
  },
  avatarCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
  },
  dueDateBadge: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#8E8D94',
  },
  claimBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  claimBtnText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
});
