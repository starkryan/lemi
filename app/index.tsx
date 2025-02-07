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
      <View className="flex-1 items-center justify-center bg-[#343541]">
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(app)" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#343541]">
      <View className="flex-1">
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
            style={{ width: width * 0.5, height: width * 0.5 }}
            resizeMode="contain"
          />

          <Text className="mt-8 text-center text-3xl font-bold text-white">Welcome to Lemi</Text>
          <Text className="mt-4 px-6 text-center text-base text-gray-300">
            Your AI-powered learning companion. Start exploring and learning today.
          </Text>
        </Animated.View>

        {/* Buttons Section */}
        <View className="gap-4 px-6 pb-12">
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity className="w-full rounded-lg bg-[#10a37f] py-4 active:bg-[#0e906f]">
              <Text className="text-center text-lg font-semibold text-white">Get Started</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity className="w-full rounded-lg border border-gray-600 bg-transparent py-4 active:bg-gray-800">
              <Text className="text-center text-lg font-semibold text-white">
                I already have an account
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GetStartedScreen;
