import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 26,
    maxHeight: '80%',
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
  },
  subtitle: {
    color: '#8E8D94',
    fontSize: 13,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  userName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyNotice: {
    textAlign: 'center',
    color: '#8E8D94',
    paddingVertical: 24,
  },
});
