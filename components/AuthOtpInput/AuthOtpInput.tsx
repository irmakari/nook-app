import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AuthOtpInputProps {
  code: string[];
  setCode: (code: string[]) => void;
  onComplete?: (codeString: string) => void;
}

export function AuthOtpInput({ code, setCode, onComplete }: AuthOtpInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    // If pasted full 6 digit string
    if (text.length > 1) {
      const digits = text.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (i < 6) newCode[i] = d;
      });
      setCode(newCode);
      if (digits.length === 6) {
        inputs.current[5]?.blur();
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete?.(newCode.join(''));
      } else {
        inputs.current[digits.length]?.focus();
      }
      return;
    }

    const cleanDigit = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanDigit;
    setCode(newCode);

    if (cleanDigit && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete?.(fullCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }).map((_, index) => {
        const isFilled = !!code[index];
        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            style={[
              styles.box,
              {
                backgroundColor: isDark ? '#222227' : '#FAF8F5',
                borderColor: isFilled
                  ? isDark
                    ? '#7FB9E6'
                    : '#2D82C4'
                  : isDark
                  ? '#33333D'
                  : '#E2DEC6',
                color: isDark ? '#FFFFFF' : '#111111',
              },
            ]}
            value={code[index] || ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={6}
            selectTextOnFocus
            textAlign="center"
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 12,
  },
  box: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
