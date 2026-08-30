import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { spaceService } from '@/services/space-service';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegistering = mode === 'register';
  const canSubmit = email.trim().length > 0 && password.length >= 8 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const credentials = { email: email.trim(), password };
      if (isRegistering) {
        await spaceService.register(credentials);
      } else {
        await spaceService.login(credentials);
      }
      router.replace('/');
    } catch (submitError) {
      setError(readError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer variant="modal">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <ScreenHeader
          title={isRegistering ? 'Create account' : 'Sign in'}
          subtitle={isRegistering ? 'Start a synced Nook profile.' : 'Use your Nook API account.'}
          showBackButton
          onBackPress={() => router.back()}
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <View style={styles.modeControl}>
            {(['login', 'register'] as const).map((item) => {
              const isActive = mode === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setMode(item);
                    setError(null);
                  }}
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: isActive ? colors.text : colors.surfaceSubtle,
                    },
                  ]}>
                  <ThemedText
                    type="button"
                    style={{ color: isActive ? colors.background : colors.textSecondary }}>
                    {item === 'login' ? 'Sign in' : 'Register'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="label">EMAIL</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@nook.app"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#222227' : '#FAF8F5',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="label">PASSWORD</ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete={isRegistering ? 'new-password' : 'password'}
              placeholder={isRegistering ? 'At least 8 chars, Aa1' : 'Your password'}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#222227' : '#FAF8F5',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: isDark ? '#3A1F2A' : '#FFF0F4' }]}>
              <Ionicons name="alert-circle-outline" size={18} color="#D94E84" />
              <ThemedText type="caption" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          <PrimaryButton
            title={isRegistering ? 'Create account' : 'Sign in'}
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function readError(error: unknown): string {
  if (!(error instanceof Error)) return 'Something went wrong.';
  if (error.message.includes('401')) return 'Email or password is incorrect.';
  if (error.message.includes('400')) return 'Check your email and password.';
  return error.message;
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 18,
    marginTop: 20,
    padding: 18,
  },
  modeControl: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  fieldGroup: {
    gap: 8,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  errorBox: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  errorText: {
    color: '#D94E84',
    flex: 1,
  },
});
