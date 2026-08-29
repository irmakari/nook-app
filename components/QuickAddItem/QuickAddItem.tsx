import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { QuickAddItemProps } from './types';
import { styles } from './styles';
import { getReadableTextColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function QuickAddItem({
  placeholder = 'Add an item...',
  accentColor,
  onAddItem,
  bottomOffset = 0,
}: QuickAddItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');

  const btnIconColor = getReadableTextColor(accentColor);

  const handleAdd = () => {
    if (!text.trim()) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAddItem(text.trim());
    setText('');
    // Keep focus so user can type the next item immediately
    inputRef.current?.focus();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#121214' : '#FAF8F5',
          borderTopColor: isDark ? '#222228' : '#EFECE6',
          paddingBottom: Math.max(bottomOffset, 10),
        },
      ]}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
            borderColor: isDark ? '#26262B' : '#EBE7E0',
          },
        ]}>
        <Ionicons
          name="add"
          size={20}
          color={isDark ? '#71717A' : '#A1A1AA'}
          style={{ marginRight: 8 }}
        />
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          blurOnSubmit={false}
          style={[
            styles.input,
            { color: isDark ? '#F4F4F5' : '#18181B' },
          ]}
        />
      </View>

      <Pressable
        onPress={handleAdd}
        disabled={!text.trim()}
        style={({ pressed }) => [
          styles.addBtn,
          {
            backgroundColor: text.trim() ? accentColor : isDark ? '#222228' : '#EBE7E0',
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}>
        <Ionicons
          name="arrow-up"
          size={20}
          color={text.trim() ? btnIconColor : isDark ? '#52525B' : '#A1A1AA'}
        />
      </Pressable>
    </View>
  );
}
