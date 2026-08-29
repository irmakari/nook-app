import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
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
  textGroup: {
    flex: 1,
    marginRight: 8,
  },
  itemText: {
    fontSize: 15,
    lineHeight: 21,
  },
  completedItemText: {
    color: '#8E8D94',
    textDecorationLine: 'line-through',
  },
  noteText: {
    color: '#8E8D94',
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
});
