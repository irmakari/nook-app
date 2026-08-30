import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_PREFIX = 'nook:';

export async function getSessionValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(`${WEB_PREFIX}${key}`) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setSessionValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(`${WEB_PREFIX}${key}`, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function deleteSessionValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(`${WEB_PREFIX}${key}`);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
