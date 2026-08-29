import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  dotBox: {
    paddingTop: 6,
    marginRight: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  mainText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    fontFamily: 'Poppins_600SemiBold',
  },
  actionText: {
    fontFamily: 'Poppins_400Regular',
  },
  targetText: {
    fontFamily: 'Poppins_500Medium',
  },
  timeText: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Poppins_400Regular',
  },
});
