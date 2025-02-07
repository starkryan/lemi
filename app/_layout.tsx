import { tokenCache } from '~/utils/cache';
import '../global.css';
import 'react-native-url-polyfill/auto';
import { ClerkProvider } from '@clerk/clerk-expo';
import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto';
import { Stack } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Ensure crypto polyfill
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: expoCryptoGetRandomValues,
  } as Crypto;
}

// Retrieve Clerk publishable key safely
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error('Missing Clerk Publishable Key');
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);

  // Ensure publishableKey is a string to satisfy type checking
  const clerkKey = publishableKey as string;
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={clerkKey}>
      <StatusBar style="light" backgroundColor="#343541" />
      <View className="flex-1 bg-[#343541]">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#343541',
            },
            animation: 'none',
            presentation: 'modal',
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
