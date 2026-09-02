import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { AuthOtpInput } from '@/components/AuthOtpInput';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { spaceService } from '@/services/space-service';

type AuthStep = 'login' | 'onboarding' | 'forgot-password';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<AuthStep>('login');

  // Onboarding Step State (1: Name, 2: Email & Phone, 3: Password, 4: OTP Verification)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification State
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Forgot Password Reset State
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [newPassword, setNewPassword] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'onboarding' && onboardingStep === 4 && resendTimer > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, onboardingStep, resendTimer]);

  const resetFormState = () => {
    setError(null);
    setInfoMessage(null);
    setOtpCode(Array(6).fill(''));
    setResendTimer(30);
    setForgotStep(1);
  };

  const handleStartOnboarding = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    resetFormState();
    setOnboardingStep(1);
    setStep('onboarding');
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setError(null);
    setInfoMessage(null);

    if (step === 'onboarding') {
      if (onboardingStep > 1) {
        setOnboardingStep((prev) => (prev - 1) as any);
      } else {
        setStep('login');
      }
    } else if (step === 'forgot-password') {
      if (forgotStep > 1) {
        setForgotStep(1);
      } else {
        setStep('login');
      }
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  // Compute initials for Step 1 Avatar Preview
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NB';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // --- Handlers ---

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await spaceService.login({ email: email.trim(), password });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    } catch (err: any) {
      setError(readError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardingStep3Submit = async () => {
    if (password.length < 8) {
      setError('Şifreniz en az 8 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor, lütfen kontrol edin.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await spaceService.sendVerificationCode(email.trim());
      setOnboardingStep(4);
      setResendTimer(30);
      setInfoMessage(`Doğrulama kodu ${email.trim()} adresine gönderildi.`);
    } catch (err: any) {
      setError(readError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteRegistration = async (codeOverride?: string) => {
    const codeStr = codeOverride || otpCode.join('');
    if (codeStr.length < 6) {
      setError('Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await spaceService.verifyCode(email.trim(), codeStr);
      await spaceService.register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    } catch (err: any) {
      setError(readError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await spaceService.sendVerificationCode(email.trim());
      setResendTimer(30);
      setCanResend(false);
      setInfoMessage('Yeni doğrulama kodu gönderildi.');
    } catch (err: any) {
      setError(readError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendForgotCode = async () => {
    if (!email.trim()) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await spaceService.forgotPassword(email.trim());
      setForgotStep(2);
      setInfoMessage(`${email.trim()} adresine şifre sıfırlama talimatları gönderildi.`);
    } catch (err: any) {
      setError(readError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const codeStr = otpCode.join('');
    if (codeStr.length < 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Yeni şifreniz en az 8 karakter olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await spaceService.resetPassword(email.trim(), codeStr, newPassword);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInfoMessage('Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.');
      setStep('login');
    } catch (err: any) {
      setError(readError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const showBackButton = step !== 'login' || router.canGoBack();

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? '#121214' : '#FAF8F5' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top + 12, 40), paddingBottom: Math.max(insets.bottom + 20, 34) },
          ]}>
          
          {/* Top Bar Header */}
          <View style={[styles.topHeader, { justifyContent: showBackButton ? 'space-between' : 'flex-end' }]}>
            {showBackButton ? (
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  {
                    backgroundColor: pressed
                      ? isDark
                        ? '#2A2A32'
                        : '#EFECE6'
                      : isDark
                      ? '#1E1E22'
                      : '#FFFFFF',
                    borderColor: isDark ? '#2E2E36' : '#E5E1D8',
                  },
                ]}>
                <Ionicons name="chevron-back" size={22} color={isDark ? '#FFFFFF' : '#111111'} />
              </Pressable>
            ) : null}

            <View style={[styles.brandBadge, { backgroundColor: isDark ? '#1E1E22' : '#FFFFFF', borderColor: isDark ? '#2E2E36' : '#E5E1D8' }]}>
              <ThemedText style={styles.brandBadgeText}>✨ nook</ThemedText>
            </View>
          </View>

          {/* Onboarding Progress Bar */}
          {step === 'onboarding' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <ThemedText type="caption" weight="bold" style={styles.progressStepText}>
                  ADIM {onboardingStep} / 4
                </ThemedText>
                <ThemedText type="caption" style={{ color: colors.textMuted }}>
                  {onboardingStep === 1
                    ? 'Profil Bilgisi'
                    : onboardingStep === 2
                    ? 'İletişim'
                    : onboardingStep === 3
                    ? 'Güvenlik'
                    : 'E-posta Doğrulama'}
                </ThemedText>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#262630' : '#EFECE6' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(onboardingStep / 4) * 100}%`,
                      backgroundColor: '#7FB9E6',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Error & Info Alerts */}
          {error ? (
            <View style={[styles.alertBox, { backgroundColor: isDark ? '#3A1F2A' : '#FFF0F4' }]}>
              <Ionicons name="alert-circle" size={20} color="#D94E84" />
              <ThemedText type="caption" style={styles.errorAlertText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          {infoMessage ? (
            <View style={[styles.alertBox, { backgroundColor: isDark ? '#1C2E26' : '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              <ThemedText type="caption" style={styles.infoAlertText}>
                {infoMessage}
              </ThemedText>
            </View>
          ) : null}

          {/* --- VIEW 1: MAIN LOGIN SCREEN --- */}
          {step === 'login' && (
            <>
              <View style={styles.heroSection}>
                <ThemedText style={styles.heroTitle}>Hoş Geldiniz</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  Nook ile sevdiklerinizle paylaştığınız özel alanlarınıza hemen bağlanın.
                </ThemedText>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.fieldGroup}>
                  <ThemedText style={styles.fieldLabel}>E-POSTA ADRESİ</ThemedText>
                  <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      keyboardType="email-address"
                      placeholder="ornek@nook.app"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.input, { color: colors.text }]}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <ThemedText style={styles.fieldLabel}>ŞİFRE</ThemedText>
                    <Pressable onPress={() => { setStep('forgot-password'); setError(null); }}>
                      <ThemedText style={styles.forgotLink}>Şifremi Unuttum?</ThemedText>
                    </Pressable>
                  </View>

                  <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      placeholder="Şifrenizi girin"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showPassword}
                      style={[styles.input, { color: colors.text }]}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.buttonSpacing}>
                  <PrimaryButton
                    title="Giriş Yap"
                    onPress={handleLogin}
                    disabled={!email.trim() || !password || isSubmitting}
                    loading={isSubmitting}
                  />
                </View>

                {/* Bottom Registration Onboarding CTA Card */}
                <View style={[styles.registerCtaCard, { backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#EFECE6' }]}>
                  <View style={styles.ctaTextCol}>
                    <ThemedText type="body" weight="bold">Henüz hesabınız yok mu?</ThemedText>
                    <ThemedText type="caption" style={{ color: colors.textMuted }}>
                      Birkaç kolay adımda Nook profilinizi oluşturun.
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={handleStartOnboarding}
                    style={({ pressed }) => [
                      styles.ctaButton,
                      {
                        backgroundColor: pressed
                          ? isDark
                            ? '#2E2E38'
                            : '#111111'
                          : isDark
                          ? '#22222A'
                          : '#18181B',
                      },
                    ]}>
                    <ThemedText style={{ color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', fontSize: 14 }}>
                      Kayıt Ol 🚀
                    </ThemedText>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* --- VIEW 2: STEP-BY-STEP ONBOARDING FLOW --- */}
          {step === 'onboarding' && (
            <View style={styles.formContainer}>
              
              {/* ONBOARDING STEP 1: AD SOYAD */}
              {onboardingStep === 1 && (
                <>
                  <View style={styles.heroSection}>
                    <ThemedText style={styles.heroTitle}>Sizi nasıl çağıralım?</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                      Profilinizde ve üye olduğunuz alanlarda görünecek ad soyad bilginizi yazın.
                    </ThemedText>
                  </View>

                  <View style={styles.avatarPreviewRow}>
                    <View style={styles.avatarPreviewCircle}>
                      <ThemedText style={styles.avatarPreviewInitials}>
                        {getInitials(fullName)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>AD SOYAD</ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                      <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                        placeholder="Örn: Irmak Arı"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.input, { color: colors.text }]}
                      />
                    </View>
                  </View>

                  <View style={styles.buttonSpacing}>
                    <PrimaryButton
                      title="Devam Et"
                      onPress={() => {
                        if (!fullName.trim()) return;
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setOnboardingStep(2);
                      }}
                      disabled={!fullName.trim()}
                    />
                  </View>
                </>
              )}

              {/* ONBOARDING STEP 2: EMAIL & TELEFON */}
              {onboardingStep === 2 && (
                <>
                  <View style={styles.heroSection}>
                    <ThemedText style={styles.heroTitle}>İletişim Bilgileri</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                      Giriş yaparken kullanacağınız e-posta adresinizi ve telefon numaranızı ekleyin.
                    </ThemedText>
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>E-POSTA ADRESİ</ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                      <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect={false}
                        keyboardType="email-address"
                        placeholder="ornek@nook.app"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.input, { color: colors.text }]}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>TELEFON NUMARASI</ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                      <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="+90 5XX XXX XX XX"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.input, { color: colors.text }]}
                      />
                    </View>
                  </View>

                  <View style={styles.buttonSpacing}>
                    <PrimaryButton
                      title="Devam Et"
                      onPress={() => {
                        if (!email.trim()) return;
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setOnboardingStep(3);
                      }}
                      disabled={!email.trim()}
                    />
                  </View>
                </>
              )}

              {/* ONBOARDING STEP 3: ŞİFRE BELİRLEME */}
              {onboardingStep === 3 && (
                <>
                  <View style={styles.heroSection}>
                    <ThemedText style={styles.heroTitle}>Şifrenizi Oluşturun</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                      Hesabınızın güvenliği için en az 8 karakterli güçlü bir şifre belirleyin.
                    </ThemedText>
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>ŞİFRE (EN AZ 8 KARAKTER)</ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        placeholder="Güçlü bir şifre belirleyin"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        style={[styles.input, { color: colors.text }]}
                      />
                      <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={colors.textMuted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>ŞİFRE TEKRARI</ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                      <Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                        placeholder="Şifrenizi tekrar girin"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        style={[styles.input, { color: colors.text }]}
                      />
                    </View>
                  </View>

                  <View style={styles.buttonSpacing}>
                    <PrimaryButton
                      title="Doğrulama Kodunu Gönder"
                      onPress={handleOnboardingStep3Submit}
                      disabled={password.length < 8 || password !== confirmPassword || isSubmitting}
                      loading={isSubmitting}
                    />
                  </View>
                </>
              )}

              {/* ONBOARDING STEP 4: OTP E-POSTA DOĞRULAMA */}
              {onboardingStep === 4 && (
                <View style={styles.verifySection}>
                  <View style={styles.heroSection}>
                    <ThemedText style={styles.heroTitle}>Son Adım: Doğrulama</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                      <ThemedText weight="bold">{email}</ThemedText> adresine gönderilen 6 haneli doğrulama kodunu girin.
                    </ThemedText>
                  </View>

                  <View style={[styles.devBadge, { backgroundColor: isDark ? '#262630' : '#F0EFEA' }]}>
                    <Ionicons name="code-slash" size={18} color="#7FB9E6" />
                    <ThemedText type="caption" style={{ color: colors.textSecondary }}>
                      Test Kodu: <ThemedText type="caption" weight="bold" style={{ color: colors.text }}>123456</ThemedText>
                    </ThemedText>
                  </View>

                  <AuthOtpInput
                    code={otpCode}
                    setCode={setOtpCode}
                    onComplete={handleCompleteRegistration}
                  />

                  <View style={styles.resendRow}>
                    {canResend ? (
                      <Pressable onPress={handleResendCode} disabled={isSubmitting}>
                        <ThemedText weight="bold" style={styles.resendLink}>
                          Kodu Tekrar Gönder
                        </ThemedText>
                      </Pressable>
                    ) : (
                      <ThemedText type="caption" style={{ color: colors.textMuted }}>
                        Yeni kod için kalan süre: {resendTimer}s
                      </ThemedText>
                    )}
                  </View>

                  <View style={styles.buttonSpacing}>
                    <PrimaryButton
                      title="Kayıt Ol ve Başla 🚀"
                      onPress={() => handleCompleteRegistration()}
                      disabled={otpCode.join('').length < 6 || isSubmitting}
                      loading={isSubmitting}
                    />
                  </View>
                </View>
              )}

            </View>
          )}

          {/* --- VIEW 3: FORGOT PASSWORD --- */}
          {step === 'forgot-password' && (
            <View style={styles.formContainer}>
              {forgotStep === 1 ? (
                <>
                  <View style={styles.heroSection}>
                    <ThemedText style={styles.heroTitle}>Şifremi Unuttum</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                      Şifrenizi yenilemek için kayıtlı e-posta adresinizi girin. Size bir doğrulama kodu göndereceğiz.
                    </ThemedText>
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>E-POSTA ADRESİ</ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                      <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder="ornek@nook.app"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.input, { color: colors.text }]}
                      />
                    </View>
                  </View>

                  <View style={styles.buttonSpacing}>
                    <PrimaryButton
                      title="Sıfırlama Kodu Gönder"
                      onPress={handleSendForgotCode}
                      disabled={!email.trim() || isSubmitting}
                      loading={isSubmitting}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.heroSection}>
                    <ThemedText style={styles.heroTitle}>Yeni Şifre Belirleyin</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                      Gelen 6 haneli doğrulama kodunu ve yeni şifrenizi girin.
                    </ThemedText>
                  </View>

                  <View style={[styles.devBadge, { backgroundColor: isDark ? '#262630' : '#F0EFEA' }]}>
                    <Ionicons name="code-slash" size={18} color="#7FB9E6" />
                    <ThemedText type="caption" style={{ color: colors.textSecondary }}>
                      Test Kodu: <ThemedText type="caption" weight="bold" style={{ color: colors.text }}>123456</ThemedText>
                    </ThemedText>
                  </View>

                  <AuthOtpInput code={otpCode} setCode={setOtpCode} />

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>YENİ ŞİFRE</ThemedText>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1C1C20' : '#FFFFFF', borderColor: isDark ? '#2C2C34' : '#E5E1D8' }]}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        autoCapitalize="none"
                        placeholder="En az 8 karakter"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        style={[styles.input, { color: colors.text }]}
                      />
                    </View>
                  </View>

                  <View style={styles.buttonSpacing}>
                    <PrimaryButton
                      title="Şifreyi Güncelle"
                      onPress={handleResetPassword}
                      disabled={otpCode.join('').length < 6 || newPassword.length < 8 || isSubmitting}
                      loading={isSubmitting}
                    />
                  </View>
                </>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function readError(error: unknown): string {
  if (!(error instanceof Error)) return 'Bir hata oluştu.';
  if (error.message.includes('401')) return 'E-posta veya şifre hatalı.';
  if (error.message.includes('400')) return 'Lütfen bilgilerinizi kontrol edin.';
  return error.message;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  brandBadgeText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.3,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStepText: {
    color: '#7FB9E6',
    fontSize: 12,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#666666',
    lineHeight: 22,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  errorAlertText: {
    color: '#D94E84',
    flex: 1,
    fontFamily: 'Poppins_500Medium',
  },
  infoAlertText: {
    color: '#2E7D32',
    flex: 1,
    fontFamily: 'Poppins_500Medium',
  },
  formContainer: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#888888',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#7FB9E6',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 6,
  },
  buttonSpacing: {
    marginTop: 10,
  },
  registerCtaCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  ctaTextCol: {
    gap: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 14,
    gap: 8,
  },
  avatarPreviewRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarPreviewCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7FB9E6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarPreviewInitials: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  verifySection: {
    gap: 16,
  },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  resendRow: {
    alignItems: 'center',
    marginVertical: 6,
  },
  resendLink: {
    fontSize: 14,
    color: '#7FB9E6',
  },
});
