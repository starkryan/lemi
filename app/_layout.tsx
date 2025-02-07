import { tokenCache } from '~/utils/cache';
import '../global.css';
import 'react-native-url-polyfill/auto';
import { ClerkProvider } from '@clerk/clerk-expo';
import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto';
import { Stack } from 'expo-router';
import * as React from 'react';
import { View, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

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

// Token cache


export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ExpoStatusBar style="light" backgroundColor="#343541" />
      <View className="flex-1" style={{ backgroundColor: '#343541' }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#343541',
            },
            animation: 'none',
            presentation: 'modal',
            // Force the background to be opaque
            navigationBarColor: '#343541',
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </View>
      <Toast />
    </ClerkProvider>
  );
}
