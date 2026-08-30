import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListTemplateOption } from '@/components/ListTemplateOption';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  ListTemplate,
  LIST_TEMPLATES,
  LIST_TEMPLATES_ARRAY,
} from '@/constants/list-templates';
import { Space, spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreateListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [space, setSpace] = useState<Space | null>(null);
  const [template, setTemplate] = useState<ListTemplate>('shopping');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSpace = async () => {
      if (spaceId) {
        const found = await spaceService.getSpaceById(spaceId);
        if (found) {
          setSpace(found);
        }
      }
    };
    loadSpace();
  }, [spaceId]);

  const accentColor = space?.accentColor || '#7FB9E6';
  const templateConfig = LIST_TEMPLATES[template];

  const handleSelectTemplate = (selected: ListTemplate) => {
    setTemplate(selected);
    if (!name || LIST_TEMPLATES_ARRAY.some((t) => t.defaultName === name)) {
      setName(LIST_TEMPLATES[selected].defaultName);
    }
  };

  const handleCreateList = async () => {
    const finalName = name.trim() || templateConfig.defaultName;

    try {
      setIsSubmitting(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const created = await spaceService.createList({
        spaceId: spaceId || 'kankiler',
        name: finalName,
        description: description.trim() || undefined,
        template,
      });

      router.replace({
        pathname: '/list/[id]',
        params: { id: created.id },
      });
    } catch (err) {
      console.error('Error creating list:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.headerWrapper}>
        <ScreenHeader
          showBackButton
          onBackPress={() => router.back()}
          title="Create a list"
          subtitle="What kind of list?"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}>
        {/* Template Selector Grid */}
        <View style={styles.sectionBlock}>
          <ThemedText type="label" style={styles.label}>
            CHOOSE A TEMPLATE
          </ThemedText>

          <View style={styles.templatesGrid}>
            {LIST_TEMPLATES_ARRAY.map((tpl) => (
              <ListTemplateOption
                key={tpl.id}
                template={tpl}
                isSelected={template === tpl.id}
                accentColor={accentColor}
                onSelect={handleSelectTemplate}
              />
            ))}
          </View>
        </View>

        {/* List Name */}
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            LIST NAME
          </ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={templateConfig.defaultName}
            placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                color: isDark ? '#F4F4F5' : '#18181B',
                borderColor: isDark ? '#26262B' : '#EBE7E0',
              },
            ]}
          />
        </View>

        {/* Optional Description */}
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            SHORT DESCRIPTION (OPTIONAL)
          </ThemedText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Cinema night suggestions, Kaş trip packing"
            placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                color: isDark ? '#F4F4F5' : '#18181B',
                borderColor: isDark ? '#26262B' : '#EBE7E0',
              },
            ]}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
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
        <PrimaryButton
          title="Create List"
          onPress={handleCreateList}
          loading={isSubmitting}
          backgroundColor={accentColor}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  label: {
    marginBottom: 10,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  textInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
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
