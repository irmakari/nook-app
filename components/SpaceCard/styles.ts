import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  spaceName: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#111111',
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#555555',
    lineHeight: 16,
  },
  memberStack: {
    marginLeft: 8,
  },
  memberText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#444444',
  },
  contextFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contextDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#111111',
    marginRight: 6,
  },
  contextText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#222222',
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#666666',
    marginLeft: 8,
  },
});
