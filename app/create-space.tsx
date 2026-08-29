import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { CreateSpaceOption, SpaceType } from '@/components/CreateSpaceOption';
import { AccentPicker } from '@/components/AccentPicker';
import { SectionToggle } from '@/components/SectionToggle';
import { PrimaryButton } from '@/components/PrimaryButton';
import { nookSpaceColors, getAccentTint } from '@/constants/theme';
import { spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { SpaceIcon } from '@/components/SpaceIcon';

interface SpaceOptionData {
  type: SpaceType;
  icon: string;
  title: string;
  description: string;
  defaultName: string;
  defaultColor: string;
  defaultSections: string[];
}

const SPACE_OPTIONS: SpaceOptionData[] = [
  {
    type: 'friends',
    icon: 'people',
    title: 'Friends',
    description: 'Plans, lists & chaos',
    defaultName: 'Kankiler',
    defaultColor: nookSpaceColors.sky,
    defaultSections: ['Plans', 'Polls', 'Shared Lists'],
  },
  {
    type: 'home',
    icon: 'home',
    title: 'Home',
    description: 'Family or roommates',
    defaultName: 'Ev',
    defaultColor: nookSpaceColors.matcha,
    defaultSections: ['To-do', 'Shopping', 'Notes'],
  },
  {
    type: 'partner',
    icon: 'heart',
    title: 'Partner',
    description: 'For you two',
    defaultName: 'Manita',
    defaultColor: nookSpaceColors.softLilac,
    defaultSections: ['Plans', 'Shared Lists', 'Notes'],
  },
  {
    type: 'trip',
    icon: 'airplane',
    title: 'Trip',
    description: 'Plan something together',
    defaultName: 'Yaz Tatili',
    defaultColor: nookSpaceColors.tangerine,
    defaultSections: ['Plans', 'Shared Lists', 'Notes'],
  },
  {
    type: 'blank',
    icon: 'sparkles',
    title: 'Blank',
    description: 'Start from scratch',
    defaultName: 'My Space',
    defaultColor: nookSpaceColors.lavender,
    defaultSections: [],
  },
];

const AVAILABLE_SECTIONS = [
  {
    name: 'Plans',
    icon: 'calendar-outline',
    description: 'Events, meetups, dates & group calendar',
  },
  {
    name: 'Polls',
    icon: 'bar-chart-outline',
    description: 'Decide what to do, where to eat & vote',
  },
  {
    name: 'Shared Lists',
    icon: 'list-outline',
    description: 'Shared wishlists, packing, recommendations',
  },
  {
    name: 'To-do',
    icon: 'checkbox-outline',
    description: 'Tasks, chores & shared action items',
  },
  {
    name: 'Shopping',
    icon: 'cart-outline',
    description: 'Groceries, market runs & shared orders',
  },
  {
    name: 'Notes',
    icon: 'document-text-outline',
    description: 'Door codes, links, wifi info & reservations',
  },
];

const ICON_PRESETS = [
  'people',
  'home',
  'heart',
  'airplane',
  'sparkles',
  'cafe',
  'wine',
  'musical-notes',
  'restaurant',
  'pizza',
  'fitness',
  'leaf',
];

export default function CreateSpaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Step state (1: Type, 2: Details & Accent, 3: Sections)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [selectedType, setSelectedType] = useState<SpaceType>('friends');
  const [name, setName] = useState('Kankiler');
  const [icon, setIcon] = useState('people');
  const [accentColor, setAccentColor] = useState<string>(nookSpaceColors.sky);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'Plans',
    'Polls',
    'Shared Lists',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectType = (type: SpaceType) => {
    setSelectedType(type);
    const opt = SPACE_OPTIONS.find((o) => o.type === type);
    if (opt) {
      setName(opt.defaultName);
      setIcon(opt.icon);
      setAccentColor(opt.defaultColor);
      setSelectedSections(opt.defaultSections);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  const handleToggleSection = (sectionName: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const handleCreateSpace = async () => {
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await spaceService.createSpace({
        name: name.trim(),
        icon,
        accentColor,
        type: selectedType,
        sections: selectedSections,
      });

      router.back();
    } catch (err) {
      console.error('Error creating space:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.15);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#121214' : '#FAF8F5',
          paddingTop: Math.max(insets.top, 20),
        },
      ]}>
      {/* Screen Header */}
      <View style={styles.headerWrapper}>
        <ScreenHeader
          showBackButton
          onBackPress={handleBack}
          title={
            step === 1
              ? "Who's this space for?"
              : step === 2
              ? 'Space Details'
              : 'Suggested Sections'
          }
          subtitle={
            step === 1
              ? 'Choose a foundation for your group'
              : step === 2
              ? 'Give your space an identity and personality'
              : 'Customize what your group can do together'
          }
          action={
            <View style={styles.stepIndicator}>
              <ThemedText style={styles.stepText}>
                Step {step} of 3
              </ThemedText>
            </View>
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}>
        {/* STEP 1: SPACE TYPE SELECTION */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            {SPACE_OPTIONS.map((opt) => (
              <CreateSpaceOption
                key={opt.type}
                type={opt.type}
                icon={opt.icon}
                title={opt.title}
                description={opt.description}
                selected={selectedType === opt.type}
                onSelect={handleSelectType}
              />
            ))}
          </View>
        )}

        {/* STEP 2: SPACE DETAILS & COLOR PICKER */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            {/* Real-time Preview Identity Banner */}
            <View
              style={[
                styles.previewIdentity,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                  borderColor: isDark ? '#26262B' : '#EFECE6',
                },
              ]}>
              <View
                style={[
                  styles.previewIconBox,
                  {
                    backgroundColor: softTint,
                    borderColor: accentColor,
                  },
                ]}>
                <SpaceIcon name={icon} size={24} color={accentColor} />
              </View>
              <View style={styles.previewTextWrapper}>
                <ThemedText type="cardTitle" style={styles.previewName}>
                  {name.trim() || 'Space Name'}
                </ThemedText>
                <ThemedText type="caption" style={styles.previewSubtitle}>
                  1 member • Ready to create
                </ThemedText>
              </View>
              <View
                style={[
                  styles.previewBadge,
                  {
                    backgroundColor: accentColor,
                  },
                ]}>
                <ThemedText style={styles.previewBadgeText}>New</ThemedText>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <ThemedText type="caption" style={styles.inputLabel}>
                SPACE NAME
              </ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Kankiler, Ev, Manita"
                placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                    color: isDark ? '#F4F4F5' : '#18181B',
                    borderColor: isDark ? '#26262B' : '#EBE7E0',
                  },
                ]}
                autoFocus
              />
            </View>

            {/* Icon Presets */}
            <View style={styles.inputGroup}>
              <ThemedText type="caption" style={styles.inputLabel}>
                CHOOSE ICON
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.emojiList}>
                {ICON_PRESETS.map((preset) => {
                  const isSelected = icon === preset;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setIcon(preset);
                      }}
                      style={[
                        styles.emojiButton,
                        {
                          backgroundColor: isSelected
                            ? softTint
                            : isDark
                            ? '#1A1A1E'
                            : '#FFFFFF',
                          borderColor: isSelected
                            ? accentColor
                            : isDark
                            ? '#26262B'
                            : '#EBE7E0',
                        },
                      ]}>
                      <SpaceIcon
                        name={preset}
                        size={22}
                        color={
                          isSelected
                            ? accentColor
                            : isDark
                            ? '#A1A1AA'
                            : '#71717A'
                        }
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Accent Color Palette Picker */}
            <View style={styles.inputGroup}>
              <ThemedText type="caption" style={styles.inputLabel}>
                SPACE COLOR
              </ThemedText>
              <AccentPicker
                selectedColor={accentColor}
                onSelectColor={setAccentColor}
                onCustomPress={() => {
                  // Custom color trigger - sets a custom stylish tone
                  setAccentColor('#A389F4');
                }}
              />
            </View>
          </View>
        )}

        {/* STEP 3: DEFAULT SECTIONS TOGGLE */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.sectionsIntro}>
              <ThemedText type="body" style={styles.introText}>
                We recommended these sections for{' '}
                <ThemedText type="body" weight="semiBold">
                  {name}
                </ThemedText>
                . You can toggle what fits your needs:
              </ThemedText>
            </View>

            {AVAILABLE_SECTIONS.map((sec) => (
              <SectionToggle
                key={sec.name}
                name={sec.name}
                description={sec.description}
                icon={sec.icon}
                enabled={selectedSections.includes(sec.name)}
                onToggle={handleToggleSection}
                accentColor={accentColor}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? '#121214' : '#FAF8F5',
            borderTopColor: isDark ? '#222227' : '#EFECE6',
            bottom: 0,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 16,
          },
        ]}>
        {step < 3 ? (
          <PrimaryButton
            title="Continue"
            onPress={handleNext}
            backgroundColor={accentColor}
          />
        ) : (
          <PrimaryButton
            title="Create Space"
            onPress={handleCreateSpace}
            loading={isSubmitting}
            backgroundColor={accentColor}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  stepIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(142, 141, 148, 0.12)',
  },
  stepText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  stepContainer: {
    marginBottom: 10,
  },
  previewIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  previewIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginRight: 14,
  },
  previewIconEmoji: {
    fontSize: 22,
  },
  previewTextWrapper: {
    flex: 1,
  },
  previewName: {
    fontSize: 17,
    lineHeight: 22,
  },
  previewSubtitle: {
    color: '#8E8D94',
    marginTop: 2,
  },
  previewBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
  },
  previewBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
  },
  emojiList: {
    gap: 8,
    paddingVertical: 2,
  },
  emojiButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  emojiText: {
    fontSize: 20,
  },
  sectionsIntro: {
    marginBottom: 16,
  },
  introText: {
    color: '#71717A',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
