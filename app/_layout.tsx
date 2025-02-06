import '../global.css';
import 'react-native-url-polyfill/auto';
import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto';
import { ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { tokenCache } from '../utils/cache';
import Toast from 'react-native-toast-message';
import * as React from 'react';
import { View } from 'react-native';

// Polyfill for crypto.getRandomValues
if (typeof crypto === 'undefined') {
  const crypto = {
    getRandomValues: expoCryptoGetRandomValues,
  };
  window.crypto = crypto;
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key');
}

export default function RootLayout() {
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <View className="flex-1 bg-[#282828]">
        <Slot />
        <Toast />
      </View>
    </ClerkProvider>
  );
}
