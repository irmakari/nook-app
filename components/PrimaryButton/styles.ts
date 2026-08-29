import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  iconContainer: {
    marginRight: 8,
  },
});
