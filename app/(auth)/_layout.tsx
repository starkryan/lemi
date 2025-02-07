import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View 
        className="flex-1 items-center justify-center" 
        style={{ backgroundColor: '#343541' }}
      >
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(app)" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#343541' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: {
            backgroundColor: '#343541',
          },
          navigationBarColor: '#343541',
          statusBarColor: '#343541',
        }}
      />
    </View>
  );
}
