import { useAuth, useClerk } from '@clerk/clerk-expo';
import { Redirect, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Home, User, Menu, LogOut, X } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Layout Group Component
const LayoutGroup = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const sidebarOpenRef = useRef(false);

  // If Clerk is still loading
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#343541]">
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  // If user is not signed in, redirect to sign-in page
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Sidebar toggle animation
  const toggleSidebar = () => {
    const toValue = sidebarOpenRef.current ? -280 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    sidebarOpenRef.current = !sidebarOpenRef.current;
  };

  // Logout confirmation
  const confirmSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { label: 'Home', icon: Home, route: '/' },
    { label: 'Profile', icon: User, route: '/profile' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#343541]">
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Logout Confirmation Modal */}
      <Modal animationType="fade" transparent visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-[80%] items-center rounded-lg bg-[#444654] p-6">
            <Text className="mb-4 text-lg font-semibold text-white">Sign Out</Text>
            <Text className="mb-6 text-center text-gray-300">Are you sure you want to sign out?</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => setShowModal(false)} className="rounded-full border border-gray-600 px-6 py-2">
                <Text className="text-gray-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmSignOut} disabled={loading} className={`rounded-full bg-[#10a37f] px-6 py-2 ${loading ? 'opacity-50' : ''}`}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white">Sign Out</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View className="flex-row items-center border-b border-gray-600 bg-[#444654] px-4 pb-2 pt-4">
        <TouchableOpacity onPress={toggleSidebar} className="p-1">
          <Menu size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 bg-[#343541]">
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Sidebar */}
      <Animated.View
        className="absolute left-0 top-0 z-50 h-full w-[280px] bg-[#444654] pt-6 shadow-lg"
        style={{ transform: [{ translateX: slideAnim }] }}
      >
        <View className="flex-row items-center justify-between border-b border-gray-600 p-4">
          <Text className="text-xl font-bold text-white">Menu</Text>
          <TouchableOpacity onPress={toggleSidebar} className="p-2">
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          {navigationItems.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => { router.push(item.route); toggleSidebar(); }} className="mb-2 flex-row items-center p-3">
              <item.icon size={20} color="#fff" />
              <Text className="ml-3 text-gray-300">{item.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity className="mt-4 flex-row items-center p-3" onPress={() => setShowModal(true)}>
            <LogOut size={20} color="#ef4444" />
            <Text className="ml-3 text-red-500">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LayoutGroup;
