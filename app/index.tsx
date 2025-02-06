import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter, Redirect } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

const GetStartedScreen = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(app)');
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(app)" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={['#ffffff', '#f3f4f6', '#e5e7eb']} className="flex-1">
        {/* Hero Section with Animation */}
        <Animated.View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}>
          <Image
            source={require('../assets/splash.png')}
            style={{ width: width * 0.8, height: width * 0.8 }}
            resizeMode="contain"
          />

          <Text className="mt-8 text-center text-3xl font-bold text-gray-800">Welcome to Lemi</Text>
          <Text className="mt-4 px-6 text-center text-base text-gray-600">
            Your personal learning companion. Start your journey to mastery today.
          </Text>
        </Animated.View>

        {/* Buttons Section */}
        <View className="gap-4 px-6 pb-12">
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity className="w-full rounded-xl bg-blue-600 py-4 active:bg-blue-700">
              <Text className="text-center text-lg font-semibold text-white">Get Started</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity className="w-full rounded-xl border border-gray-300 bg-white/80 py-4 active:bg-gray-100">
              <Text className="text-center text-lg font-semibold text-gray-700">
                I already have an account
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return <Redirect href={isSignedIn ? '/(app)' : '/(auth)/sign-in'} />;
}
