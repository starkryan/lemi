import { useAuth, useClerk } from '@clerk/clerk-expo';
import { Redirect, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Home, User, Menu, LogOut, X } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Add this layout group component
const LayoutGroup = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;

  // Handle loading state
  if (!isLoaded) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If user is not signed in, redirect to sign-in page
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const handleSignOut = () => {
    setShowModal(true);
  };

  const confirmSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? -280 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setSidebarOpen(!isSidebarOpen);
  };

  const navigationItems = [
    { label: 'Home', icon: Home, route: '/' },
    { label: 'Profile', icon: User, route: '/profile' },
  ];

  // If signed in, show the app layout with drawer navigation
  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="dark" />
      <Modal
        animationType="fade"
        transparent
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-[80%] items-center rounded-lg bg-white p-6">
            <Text className="mb-4 text-lg font-semibold">Sign Out</Text>
            <Text className="mb-6 text-center text-gray-600">
              Are you sure you want to sign out?
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="rounded-full border border-gray-300 px-6 py-2">
                <Text className="text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  confirmSignOut();
                }}
                className="rounded-full bg-red-500 px-6 py-2">
                <Text className="text-white">Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View className="flex-1">
        {/* Header - Updated with safe area padding */}
        <View className="flex-row items-center border-b border-gray-200 bg-white px-4 pb-2 pt-4">
          <TouchableOpacity onPress={toggleSidebar} className="p-1">
            <Menu size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 bg-white">
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </View>

        {/* Sidebar - Adjusted top padding to match header */}
        <Animated.View
          className="absolute left-0 top-0 z-50 h-full w-[280px] bg-white pt-6 shadow-lg"
          style={{
            transform: [{ translateX: slideAnim }],
          }}>
          <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
            <Text className="text-xl font-bold">Menu</Text>
            <TouchableOpacity onPress={toggleSidebar} className="p-2">
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            {navigationItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="mb-2 flex-row items-center rounded-lg px-2 py-3 hover:bg-gray-100"
                onPress={() => {
                  router.push(item.route);
                  toggleSidebar();
                }}>
                <item.icon size={20} color="#4B5563" />
                <Text className="ml-3 text-gray-700">{item.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-4 flex-row items-center rounded-lg px-2 py-3"
              onPress={handleSignOut}>
              <LogOut size={20} color="#EF4444" />
              <Text className="ml-3 text-red-500">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Overlay */}
        {isSidebarOpen && (
          <TouchableOpacity className="absolute inset-0 z-40 bg-black/50" onPress={toggleSidebar} />
        )}
      </View>
    </SafeAreaView>
  );
};

// Remove the ClerkProvider wrapper and export LayoutGroup directly
const RootLayout = () => {
  return <LayoutGroup />;
};

export default RootLayout;
